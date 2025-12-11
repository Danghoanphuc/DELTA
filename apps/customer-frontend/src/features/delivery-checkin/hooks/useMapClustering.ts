// apps/customer-frontend/src/features/delivery-checkin/hooks/useMapClustering.ts
/**
 * Hook for marker clustering on the map
 * Implements Property 43: Marker Clustering
 *
 * Requirements: 12.2
 */

import { useMemo } from "react";
import type { CheckinMarker, ClusteredMarker } from "../types";
import { CLUSTER_ZOOM_THRESHOLD, CLUSTER_RADIUS } from "../types";

interface UseMapClusteringOptions {
  markers: CheckinMarker[];
  zoom: number;
  mapWidth?: number;
  mapHeight?: number;
}

interface UseMapClusteringReturn {
  clusters: ClusteredMarker[];
  individualMarkers: CheckinMarker[];
  shouldCluster: boolean;
}

/**
 * Simple distance calculation between two points (in pixels at current zoom)
 */
function getPixelDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  zoom: number
): number {
  // Convert lat/lng to pixel coordinates at current zoom
  const scale = Math.pow(2, zoom);
  const worldSize = 256 * scale;

  const x1 = ((lng1 + 180) / 360) * worldSize;
  const y1 =
    ((1 -
      Math.log(
        Math.tan((lat1 * Math.PI) / 180) + 1 / Math.cos((lat1 * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    worldSize;

  const x2 = ((lng2 + 180) / 360) * worldSize;
  const y2 =
    ((1 -
      Math.log(
        Math.tan((lat2 * Math.PI) / 180) + 1 / Math.cos((lat2 * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    worldSize;

  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Simple clustering algorithm
 */
function clusterMarkers(
  markers: CheckinMarker[],
  zoom: number,
  radius: number
): { clusters: ClusteredMarker[]; unclustered: CheckinMarker[] } {
  const clusters: ClusteredMarker[] = [];
  const unclustered: CheckinMarker[] = [];
  const processed = new Set<string>();

  for (const marker of markers) {
    if (processed.has(marker._id)) continue;

    // Find nearby markers
    const nearby: CheckinMarker[] = [marker];
    processed.add(marker._id);

    for (const other of markers) {
      if (processed.has(other._id)) continue;

      const distance = getPixelDistance(
        marker.latitude,
        marker.longitude,
        other.latitude,
        other.longitude,
        zoom
      );

      if (distance <= radius) {
        nearby.push(other);
        processed.add(other._id);
      }
    }

    if (nearby.length > 1) {
      // Create cluster
      const avgLat =
        nearby.reduce((sum, m) => sum + m.latitude, 0) / nearby.length;
      const avgLng =
        nearby.reduce((sum, m) => sum + m.longitude, 0) / nearby.length;

      clusters.push({
        id: `cluster-${marker._id}`,
        longitude: avgLng,
        latitude: avgLat,
        count: nearby.length,
        checkins: nearby,
      });
    } else {
      unclustered.push(marker);
    }
  }

  return { clusters, unclustered };
}

export function useMapClustering(
  options: UseMapClusteringOptions
): UseMapClusteringReturn {
  const { markers, zoom } = options;

  const shouldCluster = zoom < CLUSTER_ZOOM_THRESHOLD;

  const { clusters, individualMarkers } = useMemo(() => {
    if (!shouldCluster || markers.length <= 1) {
      return {
        clusters: [],
        individualMarkers: markers,
      };
    }

    const { clusters, unclustered } = clusterMarkers(
      markers,
      zoom,
      CLUSTER_RADIUS
    );

    return {
      clusters,
      individualMarkers: unclustered,
    };
  }, [markers, zoom, shouldCluster]);

  return {
    clusters,
    individualMarkers,
    shouldCluster,
  };
}
