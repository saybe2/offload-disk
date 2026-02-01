export function log(scope: string, message: string) {
  console.log(`[${scope}] ${new Date().toISOString()} ${message}`);
}
