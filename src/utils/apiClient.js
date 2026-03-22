import axios from "axios";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  (import.meta.env.VITE_API_BASE_URL || "").trim(),
);

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

export const buildApiUrl = (value) => {
  if (typeof value !== "string") return value;
  if (!API_BASE_URL) return value;
  if (isAbsoluteUrl(value)) return value;
  if (!value.startsWith("/api")) return value;
  return `${API_BASE_URL}${value}`;
};

export const configureApiClient = () => {
  if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
  }

  axios.defaults.withCredentials = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const shouldRewrite = typeof input === "string" || input instanceof URL;
    const requestUrl = shouldRewrite ? buildApiUrl(String(input)) : input;

    return originalFetch(requestUrl, {
      credentials: "include",
      ...init,
    });
  };
};
