// apps/customer-frontend/src/features/delivery-checkin/components/DeliveryMapView.tsx
/**
 * Customer Dashboard Map View Component
 * Displays all delivery check-ins on an interactive map with Goong.io integration
 *
 * Requirements: 5.1, 5.2, 5.5, 5.6, 12.2, 12.3
 */

import { useState, useCallback, useRef, useEffect } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl";
import { MapPin, Package, Loader2, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useCustomerCheckins } from "../hooks/useCustomerCheckins";
import { useMapClustering } from "../hooks/useMapClustering";
import { CheckinPopup } from "./CheckinPopup";
import { MapDateFilter } from "./MapDateFilter";
import { ClusterMarker } from "./ClusterMarker";
import { GOONG_CONFIG } from "@/lib/mapConfig";
import type { MapBounds, MapViewport, CheckinMarker } from "../types";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  CLUSTER_ZOOM_THRESHOLD,
} from "../types";

interface DeliveryMapViewProps {
  onViewThread?: (threadId: string) => void;
  className?: string;
}

export function DeliveryMapView({
  onViewThread,
  className = "",
}: DeliveryMapViewProps) {
  const mapRef = useRef<MapRef>(null);

  // Map viewport state
  const [viewport, setViewport] = useState<MapViewport>({
    longitude: DEFAULT_MAP_CENTER.longitude,
    latitude: DEFAULT_MAP_CENTER.latitude,
    zoom: DEFAULT_MAP_ZOOM,
  });

  // UI state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Customer check-ins hook
  const {
    checkins,
    selectedCheckin,
    isLoading,
    isLoadingDetail,
    error,
    dateRange,
    setDateRange,
    clearDateRange,
    fetchCheckins,
    fetchCheckinsInBounds,
    selectCheckin,
    clearSelectedCheckin,
  } = useCustomerCheckins();

  // Clustering hook
  const { clusters, individualMarkers, shouldCluster } = useMapClustering({
    markers: checkins,
    zoom: viewport.zoom,
  });

  /**
   * Handle map move/zoom - load markers within viewport bounds
   * Implements Property 44: Viewport Bounds Loading
   */
  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();

    if (bounds) {
      const mapBounds: MapBounds = {
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      };

      fetchCheckinsInBounds(mapBounds);
    }
  }, [fetchCheckinsInBounds]);

  /**
   * Handle marker click - show popup with details
   */
  const handleMarkerClick = useCallback(
    (marker: CheckinMarker) => {
      setSelectedMarkerId(marker._id);
      selectCheckin(marker._id);

      // Center map on marker
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [marker.longitude, marker.latitude],
          zoom: Math.max(viewport.zoom, 14),
          duration: 500,
        });
      }
    },
    [selectCheckin, viewport.zoom]
  );

  /**
   * Handle cluster click - zoom in to show individual markers
   */
  const handleClusterClick = useCallback(
    (cluster: { longitude: number; latitude: number; count: number }) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [cluster.longitude, cluster.latitude],
          zoom: CLUSTER_ZOOM_THRESHOLD + 1,
          duration: 500,
        });
      }
    },
    []
  );

  /**
   * Close popup
   */
  const handleClosePopup = useCallback(() => {
    setSelectedMarkerId(null);
    clearSelectedCheckin();
  }, [clearSelectedCheckin]);

  /**
   * Center map on user's location
   */
  const handleCenterOnUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 14,
              duration: 1000,
            });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  /**
   * Center on most recent check-in
   */
  useEffect(() => {
    if (checkins.length > 0 && !selectedMarkerId) {
      // Sort by date and get most recent
      const sorted = [...checkins].sort(
        (a, b) =>
          new Date(b.checkinAt).getTime() - new Date(a.checkinAt).getTime()
      );
      const mostRecent = sorted[0];

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [mostRecent.longitude, mostRecent.latitude],
          zoom: DEFAULT_MAP_ZOOM,
          duration: 1000,
        });
      }
    }
  }, [checkins.length]); // Only run when checkins first load

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {/* Map */}
      <Map
        ref={mapRef}
        mapboxAccessToken="not-required-for-goong"
        mapStyle={GOONG_CONFIG.STYLE_URL}
        initialViewState={viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onMoveEnd={handleMapMove}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Cluster markers */}
        {shouldCluster &&
          clusters.map((cluster) => (
            <Marker
              key={cluster.id}
              longitude={cluster.longitude}
              latitude={cluster.latitude}
              anchor="center"
              onClick={() => handleClusterClick(cluster)}
            >
              <ClusterMarker count={cluster.count} />
            </Marker>
          ))}

        {/* Individual markers */}
        {individualMarkers.map((marker) => (
          <Marker
            key={marker._id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(marker)}
          >
            <div
              className={`cursor-pointer transition-transform hover:scale-110 ${
                selectedMarkerId === marker._id ? "scale-125" : ""
              }`}
            >
              {marker.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={marker.thumbnailUrl}
                    alt={marker.shipperName}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-0.5">
                    <Package className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="bg-orange-500 rounded-full p-2 shadow-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Refresh button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchCheckins}
          disabled={isLoading}
          className="bg-white shadow-md"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">Làm mới</span>
        </Button>

        {/* Date filter toggle */}
        <Button
          variant={dateRange.startDate ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={dateRange.startDate ? "" : "bg-white shadow-md"}
        >
          <Calendar className="w-4 h-4" />
          <span className="ml-2">
            {dateRange.startDate ? "Đang lọc" : "Lọc theo ngày"}
          </span>
        </Button>
      </div>

      {/* Date filter panel */}
      {showDateFilter && (
        <div className="absolute top-4 left-40 z-10">
          <MapDateFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClear={clearDateRange}
            onClose={() => setShowDateFilter(false)}
          />
        </div>
      )}

      {/* Check-in count badge */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2">
        <span className="text-sm text-gray-600">
          {checkins.length} điểm giao hàng
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md">
          {error}
        </div>
      )}

      {/* Check-in popup */}
      {selectedCheckin && (
        <CheckinPopup
          checkin={selectedCheckin}
          isLoading={isLoadingDetail}
          onClose={handleClosePopup}
          onViewThread={onViewThread}
        />
      )}
    </div>
  );
}
