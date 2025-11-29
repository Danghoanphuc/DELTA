// apps/customer-backend/src/shared/utils/geo.utils.js
/**
 * Geospatial Utilities
 * Calculate distance, check radius, etc.
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {Array|Object} point1 - [lng, lat] or { lng, lat } or { coordinates: [lng, lat] }
 * @param {Array|Object} point2 - [lng, lat] or { lng, lat } or { coordinates: [lng, lat] }
 * @returns {Number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  // Normalize input to [lng, lat]
  const [lng1, lat1] = normalizePoint(point1);
  const [lng2, lat2] = normalizePoint(point2);

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Check if a point is within a radius from center
 * @param {Array|Object} point - Point to check
 * @param {Array|Object} center - Center point
 * @param {Number} radiusKm - Radius in kilometers
 * @returns {Boolean} True if within radius
 */
export const isWithinRadius = (point, center, radiusKm) => {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
};

/**
 * Calculate esti