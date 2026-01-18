import  Cookies  from "js-cookie";
import { toast } from "sonner";

export const setAuthToken = (token: string) => {
  Cookies.set("accessToken", token, {
    expires: 7,
    secure: true,
    sameSite: "None",
    path: "/",
  });
};

export const getAuthToken = () => {
  const token = Cookies.get("accessToken");
  return token;
};

export const removeAuthToken = (router: any) => {
  Cookies.remove("accessToken", { path: "/" });
  router.push("/auth/login");
  toast.success("Logged out successfully.");
};
