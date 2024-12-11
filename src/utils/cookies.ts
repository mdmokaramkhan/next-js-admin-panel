import  Cookies  from "js-cookie";

export const setAuthToken = (token: string) => {
  console.log("Setting token:", token);
  Cookies.set("accessToken", token, {
    expires: 7,
    secure: false,
    sameSite: "Strict",
    path: "/",
  });
  console.log("Current token:", Cookies.get("accessToken"));
};

export const getAuthToken = () => {
  const token = Cookies.get("accessToken");
  console.log("Getting token:", token);
  return token;
};

export const removeAuthToken = () => {
  console.log("Removing token");
  Cookies.remove("accessToken", { path: "/" });
  window.location.href = "/auth/login";
};
