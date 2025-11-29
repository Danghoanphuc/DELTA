// apps/customer-frontend/src/lib/mapConfig.ts
/**
 * Goong Map Configuration
 * Disables Mapbox telemetry to prevent CORS errors when using Goong tiles
 */

// Disable Mapbox telemetry globally
if (typeof window !== "undefined") {
  // Prevent mapbox-gl from sending telemetry data
  (window as any).mapboxgl = (window as any).mapboxgl || {};
  (window as any).mapboxgl.accessToken = "goong-api-key-not-required";

  // ✅ Block Mapbox telemetry requests (silent fail)
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0]?.toString() || "";

    // Block Mapbox telemetry endpoints - return immediately without making request
    if (
      url.includes("events.mapbox.com") ||
      url.includes("api.mapbox.com/map-sessions")
    ) {
      // Return a fake successful response immediately
      return Promise.resolve(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return originalFetch.apply(this, args);
  };

  // ✅ Also suppress console errors from Mapbox
  const originalError = console.error;
  console.error = function (...args) {
    const message = args[0]?.toString() || "";
    // Suppress Mapbox telemetry errors
    if (
      message.includes("mapbox.com") ||
      message.includes("events.mapbox") ||
      message.includes("map-sessions")
    ) {
      return;
    }
    return originalError.apply(this, args);
  };
}

export const GOONG_CONFIG = {
  MAPTILES_KEY: import.meta.env.VITE_GOONG_MAPTILES_KEY || "",
  API_KEY: import.meta.env.VITE_GOONG_API_KEY || "",
  STYLE_URL: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${
    import.meta.env.VITE_GOONG_MAPTILES_KEY || ""
  }`,
};
