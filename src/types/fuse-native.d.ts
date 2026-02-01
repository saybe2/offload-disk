declare module "fuse-native" {
  interface FuseOptions {
    debug?: boolean;
    force?: boolean;
    allowOther?: boolean;
  }

  class Fuse {
    constructor(mountPath: string, ops: any, options?: FuseOptions);
    mount(cb: (err?: Error) => void): void;
    unmount(cb: (err?: Error) => void): void;
  }

  export = Fuse;
}
