import { spawn } from "child_process";
import { config } from "../config.js";
import { log } from "../logger.js";

const SMB_USER_SCRIPT = process.env.SMB_USER_SCRIPT || "/home/container/tools/smb_user.sh";

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(stderr || `smb_user_failed:${code}`));
    });
  });
}

async function runSmbUser(action: "ensure" | "delete", username: string, password?: string) {
  if (!config.smbEnabled) return;
  const args = [action, username];
  if (password) args.push(password);
  const isRoot = typeof process.getuid === "function" && process.getuid() === 0;
  if (isRoot) {
    await runCommand(SMB_USER_SCRIPT, args);
  } else {
    await runCommand("sudo", [SMB_USER_SCRIPT, ...args]);
  }
}

export async function ensureSmbUser(username: string, password: string) {
  try {
    await runSmbUser("ensure", username, password);
  } catch (err) {
    log("smb", `ensure user failed for ${username}: ${err instanceof Error ? err.message : err}`);
  }
}

export async function deleteSmbUser(username: string) {
  try {
    await runSmbUser("delete", username);
  } catch (err) {
    log("smb", `delete user failed for ${username}: ${err instanceof Error ? err.message : err}`);
  }
}
