export const API_URL = "https://web-tools-ashen.vercel.app";

export const PUBLIC_API_ROUTES = {
  languages: {
    get: `${API_URL}/i18n/languages`,
  },
  lists: {
    getAll: `${API_URL}/api/lists`,
    getBySlug: `${API_URL}/api/lists/{slug}`,
  },
};
