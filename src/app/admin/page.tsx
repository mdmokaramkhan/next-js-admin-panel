"use client";

import { getAuthToken } from "@/utils/cookies";
import { useRouter } from "next/navigation"; // Correct import for useRouter
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter(); // Initialize useRouter properly

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login"); // Redirect to login if no token exists
    } else {
      router.push("/admin/overview"); // Redirect to admin if token exists
    }
  }, [router]); // Dependency array includes router

  return null; // Render nothing as redirection happens immediately
}
