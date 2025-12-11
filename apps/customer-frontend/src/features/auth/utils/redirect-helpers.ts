// apps/customer-frontend/src/features/auth/utils/redirect-helpers.ts
// ✅ Centralized redirect logic after authentication

import { NavigateFunction } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Redirect user after successful authentication
 * Priority: redirectTo > organization > shipper > from path > printer > /app
 */
export function redirectAfterAuth(
  navigate: NavigateFunction,
  fromPath?: string,
  redirectTo?: string
): void {
  const { activeContext, user, activeOrganizationProfile } =
    useAuthStore.getState();

  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log("[redirectAfterAuth] activeContext:", activeContext);
    console.log("[redirectAfterAuth] redirectTo:", redirectTo);
    console.log("[redirectAfterAuth] fromPath:", fromPath);
    console.log("[redirectAfterAuth] user profiles:", {
      organizationProfileId: user?.organizationProfileId,
      shipperProfileId: user?.shipperProfileId,
      printerProfileId: user?.printerProfileId,
    });
  }

  // ✅ PRIORITY 0: Explicit redirectTo (from CTA buttons)
  if (redirectTo && redirectTo !== "/signin" && redirectTo !== "/signup") {
    if (isDev)
      console.log(
        "[redirectAfterAuth] Redirecting to explicit redirectTo:",
        redirectTo
      );
    navigate(redirectTo, { replace: true });
    return;
  }

  // ✅ PRIORITY 1: Organization dashboard (nếu user có organization profile)
  if (activeContext === "organization") {
    if (isDev) console.log("[redirectAfterAuth] User has organization profile");

    // Check onboarding status
    if (
      activeOrganizationProfile &&
      !activeOrganizationProfile.onboardingCompleted
    ) {
      if (isDev)
        console.log("[redirectAfterAuth] Redirecting to organization setup");
      navigate("/organization/setup", { replace: true });
      return;
    }

    if (isDev)
      console.log("[redirectAfterAuth] Redirecting to organization dashboard");
    navigate("/organization/dashboard", { replace: true });
    return;
  }

  // ✅ PRIORITY 2: Shipper portal (nếu user có shipper profile)
  if (activeContext === "shipper") {
    if (isDev) console.log("[redirectAfterAuth] Redirecting to shipper portal");
    navigate("/shipper/app", { replace: true });
    return;
  }

  // ✅ PRIORITY 3: From path (nếu có và hợp lệ)
  if (
    fromPath &&
    fromPath !== "/" &&
    fromPath !== "/signin" &&
    fromPath !== "/signup"
  ) {
    if (isDev)
      console.log("[redirectAfterAuth] Redirecting to from path:", fromPath);
    navigate(fromPath, { replace: true });
    return;
  }

  // ✅ PRIORITY 4: Printer dashboard (nếu user có printer profile)
  if (activeContext === "printer") {
    if (isDev)
      console.log("[redirectAfterAuth] Redirecting to printer dashboard");
    navigate("/printer/dashboard", { replace: true });
    return;
  }

  // ✅ PRIORITY 4: Check localStorage cho postAuthRedirect với expiry
  const postAuthRedirectStr = localStorage.getItem("postAuthRedirect");
  if (postAuthRedirectStr) {
    try {
      const redirectData = JSON.parse(postAuthRedirectStr);
      // Check expiry (10 phút)
      if (redirectData.expiry && Date.now() < redirectData.expiry) {
        localStorage.removeItem("postAuthRedirect");
        if (isDev)
          console.log(
            "[redirectAfterAuth] Redirecting to postAuthRedirect:",
            redirectData.path
          );
        navigate(redirectData.path, { replace: true });
        return;
      } else {
        // Expired - xóa đi
        localStorage.removeItem("postAuthRedirect");
        if (isDev) console.log("[redirectAfterAuth] postAuthRedirect expired");
      }
    } catch (e) {
      // Invalid JSON - xóa đi
      localStorage.removeItem("postAuthRedirect");
    }
  }

  // ✅ PRIORITY 5: Default to /app (customer context)
  if (isDev) console.log("[redirectAfterAuth] Redirecting to /app (default)");
  navigate("/app", { replace: true });
}
