import { getAuthToken, removeAuthToken } from "@/utils/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  router?: any
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache", // Prevent browser caching
    Pragma: "no-cache", // Compatibility with HTTP/1.0
  };

  // Retrieve token and set Authorization header if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }

    return await response.json();
  } catch (error) {
    removeAuthToken(router);
    throw new Error((error as Error).message);
  }
}
