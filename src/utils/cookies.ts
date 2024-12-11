import  Cookies  from "js-cookie";
import { toast } from "sonner";

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

export const removeAuthToken = (router: any) => {
  console.log("Removing token");
  Cookies.remove("accessToken", { path: "/" });
  router.push("/auth/login");
  toast.success("Logged out successfully.");
};
