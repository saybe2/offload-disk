import { Folder } from "../models/Folder.js";

export async function getDescendantFolderIds(userId: string, rootId: string) {
  const folders = await Folder.find({ userId }).lean();
  const byParent = new Map<string, string[]>();
  for (const f of folders) {
    const parentKey = f.parentId ? f.parentId.toString() : "root";
    const list = byParent.get(parentKey) || [];
    list.push(f._id.toString());
    byParent.set(parentKey, list);
  }

  const result: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);
    const children = byParent.get(current);
    if (children) {
      stack.push(...children);
    }
  }
  return result;
}
