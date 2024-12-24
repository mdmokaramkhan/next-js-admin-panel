import { getAuthToken, removeAuthToken } from "@/utils/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  router?: any
) {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

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
    const response = await fetch(`${API_BASE_URL}/admin${normalizedEndpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // Better error handling
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', (error as Error).message );
    if ((error as Error).message === "Session expired or logged out" || (error as Error).message === "Unauthorized Access") {
      removeAuthToken(router);
    }
    throw error;
  }
}
