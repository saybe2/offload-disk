export function sanitizeFilename(name: string) {
  const invalid = /[<>:"/\\|?*\x00-\x1F]/g;
  let safe = name.replace(invalid, "_");
  safe = safe.replace(/[. ]+$/g, "");
  if (!safe) safe = "_";
  const upper = safe.toUpperCase();
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/.test(upper);
  if (reserved) safe = `_${safe}`;
  if (safe.length > 255) safe = safe.slice(0, 255);
  return safe;
}