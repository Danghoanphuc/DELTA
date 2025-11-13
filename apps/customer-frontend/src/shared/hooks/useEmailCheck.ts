// frontend/src/hooks/useEmailCheck.ts
import { useState, useCallback } from "react";
import { debounce } from "lodash"; // Cần cài: npm install lodash
import api from "@/shared/lib/axios";

interface EmailCheckResult {
  exists: boolean;
  checking: boolean;
  error: string | null;
}

export function useEmailCheck() {
  const [result, setResult] = useState<EmailCheckResult>({
    exists: false,
    checking: false,
    error: null,
  });

  // Debounced check email function
  const checkEmail = useCallback(
    debounce(async (email: string) => {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setResult({ exists: false, checking: false, error: null });
        return;
      }

      setResult({ exists: false, checking: true, error: null });

      try {
        // API endpoint để check email (cần tạo ở backend)
        const res = await api.post("/auth/check-email", { email });
        setResult({
          exists: res.data.exists,
          checking: false,
          error: null,
        });
      } catch (err: any) {
        console.error("Error checking email:", err);
        setResult({
          exists: false,
          checking: false,
          error: "Không thể kiểm tra email",
        });
      }
    }, 500), // Wait 500ms after user stops typing
    []
  );

  return {
    ...result,
    checkEmail,
  };
}
