import  Cookies  from "js-cookie";
import { toast } from "sonner";

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") {
    return; // Server-side, skip
  }

  // Determine if we're in production (HTTPS)
  const isProduction = window.location.protocol === "https:";
  
  // Check if we need cross-site cookies (frontend and backend on different domains)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const currentOrigin = window.location.origin;
  let needsCrossSite = false;
  
  if (API_BASE_URL) {
    try {
      const apiOrigin = new URL(API_BASE_URL).origin;
      needsCrossSite = apiOrigin !== currentOrigin;
    } catch (error) {
      // If URL parsing fails, assume same-site
      needsCrossSite = false;
    }
  }

  // Cookie options optimized for production
  const cookieOptions: {
    expires: number;
    secure: boolean;
    sameSite: "Lax" | "Strict" | "None";
    path: string;
    domain?: string;
  } = {
    expires: 7,
    secure: isProduction, // Only use secure in production (HTTPS)
    sameSite: needsCrossSite ? "None" : "Lax", // Use None for cross-site, Lax for same-site
    path: "/",
  };

  // For cross-site cookies in production, ensure secure is true
  if (needsCrossSite && isProduction) {
    cookieOptions.secure = true;
  }

  try {
    Cookies.set("accessToken", token, cookieOptions);
    
    // Verify cookie was set (helps with debugging)
    const verifyToken = Cookies.get("accessToken");
    if (!verifyToken && process.env.NODE_ENV === "development") {
      console.warn("Cookie may not have been set. Check browser console for cookie restrictions.");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to set auth token cookie:", error);
    }
    // Fallback: try without secure in development
    if (!isProduction) {
      Cookies.set("accessToken", token, {
        expires: 7,
        secure: false,
        sameSite: "Lax",
        path: "/",
      });
    }
  }
};

export const getAuthToken = () => {
  const token = Cookies.get("accessToken");
  return token;
};

export const removeAuthToken = (router: any) => {
  if (typeof window === "undefined") {
    return;
  }

  // Remove cookie with same options used for setting
  const isProduction = window.location.protocol === "https:";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const currentOrigin = window.location.origin;
  let needsCrossSite = false;
  
  if (API_BASE_URL) {
    try {
      const apiOrigin = new URL(API_BASE_URL).origin;
      needsCrossSite = apiOrigin !== currentOrigin;
    } catch (error) {
      // If URL parsing fails, assume same-site
      needsCrossSite = false;
    }
  }

  Cookies.remove("accessToken", {
    path: "/",
    secure: isProduction && needsCrossSite,
    sameSite: needsCrossSite ? "None" : "Lax",
  });
  
  router.push("/auth/login");
  toast.success("Logged out successfully.");
};
