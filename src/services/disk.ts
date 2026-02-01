import checkDiskSpaceModule from "check-disk-space";
import type { DiskSpace } from "check-disk-space";

type CheckDiskSpaceFn = (directoryPath: string) => Promise<DiskSpace>;

const checkDiskSpace = ((checkDiskSpaceModule as unknown as { default?: CheckDiskSpaceFn }).default ??
  (checkDiskSpaceModule as unknown as CheckDiskSpaceFn));

export { checkDiskSpace };
export type { DiskSpace };
