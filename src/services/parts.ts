import type { ArchivePart } from "../models/Archive.js";

export function uniqueParts(parts: ArchivePart[] | undefined | null) {
  const map = new Map<number, ArchivePart>();
  for (const part of parts || []) {
    map.set(part.index, part);
  }
  return Array.from(map.values()).sort((a, b) => a.index - b.index);
}
