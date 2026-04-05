const DEFAULT_API_URL = "https://web-tools-ashen.vercel.app/api";
// const DEFAULT_API_URL = "http://localhost:3000/api";

export interface ListField {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "date" | "select" | "url" | "richtext";
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface List {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: ListField[];
  _creationTime: number;
}

export interface ListItem {
  _id: string;
  listId: string;
  projectId: string;
  values: Record<string, unknown>;
  order: number;
  createdBy: string;
  _creationTime: number;
}

export interface ListWithItems extends List {
  items: ListItem[];
}

export interface ListsClientOptions {
  projectToken?: string;
  apiUrl?: string;
}

function resolveToken(projectToken?: string): string {
  return projectToken ?? process.env.NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN ?? "";
}

function resolveApiUrl(apiUrl?: string): string {
  return apiUrl ?? DEFAULT_API_URL;
}

export async function fetchLists(opts?: ListsClientOptions): Promise<List[]> {
  const token = resolveToken(opts?.projectToken);
  const apiUrl = resolveApiUrl(opts?.apiUrl);

  if (!token) {
    console.error(
      "[@webtools/lists] Missing projectToken. Set NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN in your .env or pass it via options.",
    );
    return [];
  }

  const res = await fetch(`${apiUrl}/lists`, {
    headers: { "X-Project-Token": token },
  });

  if (!res.ok) {
    console.error(`[@webtools/lists] Failed to fetch lists: ${res.status}`);
    return [];
  }

  return res.json();
}

export async function fetchListBySlug(
  slug: string,
  opts?: ListsClientOptions,
): Promise<ListWithItems | null> {
  const token = resolveToken(opts?.projectToken);
  const apiUrl = resolveApiUrl(opts?.apiUrl);

  if (!token) {
    console.error(
      "[@webtools/lists] Missing projectToken. Set NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN in your .env or pass it via options.",
    );
    return null;
  }

  const res = await fetch(`${apiUrl}/lists/${encodeURIComponent(slug)}`, {
    headers: { "X-Project-Token": token },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    console.error(
      `[@webtools/lists] Failed to fetch list "${slug}": ${res.status}`,
    );
    return null;
  }

  return res.json();
}
