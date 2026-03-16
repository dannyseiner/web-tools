type Messages = Record<string, unknown>;

export function mergeModules(
  modules: Record<string, { default?: Messages } | Messages>,
): Messages {
  const merged: Messages = {};

  for (const [path, mod] of Object.entries(modules)) {
    const file = path.split("/").pop() ?? "";
    const ns = file.replace(/\.\w+$/, "");
    const data = (mod as { default?: Messages }).default ?? (mod as Messages);
    merged[ns] = data;
  }

  return merged;
}

export async function loadMessages(
  locale: string,
  messagesDir: string,
): Promise<Messages> {
  const fs = await import("fs");
  const path = await import("path");

  const localeDir = path.join(messagesDir, locale);

  if (!fs.existsSync(localeDir)) {
    return {};
  }

  const files = fs
    .readdirSync(localeDir)
    .filter((f: string) => f.endsWith(".json"));
  const merged: Messages = {};

  for (const file of files) {
    const ns = file.replace(/\.json$/, "");
    const content = fs.readFileSync(path.join(localeDir, file), "utf-8");
    merged[ns] = JSON.parse(content);
  }

  return merged;
}
