import archiver from "archiver";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface FileEntry {
  path: string;
  name: string;
  originalName?: string;
  size: number;
}

export interface PartEntry {
  index: number;
  path: string;
  size: number;
  hash: string;
}

export function zipEntryName(file: FileEntry) {
  return (file.originalName || file.name).replace(/[\\/]/g, "_");
}

export async function createZip(files: FileEntry[], outputPath: string) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 0 } });

  const done = new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("warning", reject);
    archive.on("error", reject);
  });

  archive.pipe(output);
  for (const file of files) {
    archive.file(file.path, { name: zipEntryName(file) });
  }
  await archive.finalize();
  await done;
}

export async function splitFileIntoParts(filePath: string, chunkSizeBytes: number, outDir: string) {
  await fs.promises.mkdir(outDir, { recursive: true });
  const parts: PartEntry[] = [];
  let partIndex = 0;
  let currentSize = 0;
  let currentStream: fs.WriteStream | null = null;
  let currentPath = "";
  let hash = crypto.createHash("sha256");

  const openNewPart = () => {
    currentPath = path.join(outDir, `part_${partIndex}`);
    currentStream = fs.createWriteStream(currentPath);
    currentSize = 0;
    hash = crypto.createHash("sha256");
  };

  openNewPart();

  await new Promise<void>((resolve, reject) => {
    const rs = fs.createReadStream(filePath);
    rs.on("error", reject);
    rs.on("data", (chunk: Buffer | string) => {
      const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      let offset = 0;
      while (offset < data.length) {
        if (!currentStream) {
          openNewPart();
        }
        const remaining = chunkSizeBytes - currentSize;
        const slice = data.subarray(offset, offset + remaining);
        currentStream!.write(slice);
        hash.update(slice);
        currentSize += slice.length;
        offset += slice.length;

        if (currentSize >= chunkSizeBytes) {
          currentStream!.end();
          parts.push({
            index: partIndex,
            path: currentPath,
            size: currentSize,
            hash: hash.digest("hex")
          });
          partIndex += 1;
          currentStream = null;
        }
      }
    });
    rs.on("end", () => {
      if (currentStream) {
        currentStream.end();
        parts.push({
          index: partIndex,
          path: currentPath,
          size: currentSize,
          hash: hash.digest("hex")
        });
      }
      resolve();
    });
  });

  return parts;
}
