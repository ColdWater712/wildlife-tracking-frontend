"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/components/toast";
import { logoutRequest } from "@/services/auth.service";

export const useLogout = () => {
  const router = useRouter();
  const { showToast } = useToast();

  return useCallback(async () => {
    try {
      const result = await logoutRequest();

      showToast(result.message, result.ok ? "success" : "error");
    } catch {
      showToast("Gagal menghubungi server aplikasi.", "error");
    } finally {
      router.push("/login");
      router.refresh();
    }
  }, [router, showToast]);
};
