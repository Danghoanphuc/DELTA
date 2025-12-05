// Debug component để test Turnstile
import { useTurnstile } from "@/hooks/useTurnstile";

export function TurnstileDebug() {
  const { TurnstileWidget, token, isLoading } = useTurnstile();

  return (
    <div className="p-8 border-2 border-blue-500 bg-blue-50">
      <h2 className="text-xl font-bold mb-4">Turnstile Debug</h2>

      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        <div>
          <strong>Token:</strong> {token || "Not verified yet"}
        </div>
        <div>
          <strong>Env Key:</strong>{" "}
          {import.meta.env.VITE_CLOUDFLARE_SITE_KEY || "MISSING"}
        </div>
        <div>
          <strong>Key Type:</strong>{" "}
          {typeof import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
        </div>

        <div className="border-t pt-4">
          <strong>Widget:</strong>
          <TurnstileWidget />
        </div>
      </div>
    </div>
  );
}
