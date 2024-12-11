import Cookies from "js-cookie";

export const setAuthToken = (token: string) => {
  Cookies.set("accessToken", token, {
    expires: 7, // Token valid for 7 days
    secure: true, // Ensure it's a secure cookie
    sameSite: "Strict", // Protect against CSRF
  });
};

export const getAuthToken = () => {
  return Cookies.get("accessToken");
};

export const removeAuthToken = () => {
  Cookies.remove("accessToken");
};
