/**
 * BloodLink AI – Matching Logic
 * 
 * Core algorithm for matching blood donors to hospital requests.
 * Uses the Haversine formula to calculate distances between coordinates
 * and filters donors by blood group compatibility within a 20km radius.
 */

// Maximum search radius in kilometers
const MAX_RADIUS_KM = 20;

/**
 * Haversine formula – calculates the great-circle distance
 * between two points on Earth given their lat/lng coordinates.
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Convert degrees to radians */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate expected time of arrival (ETA) based on distance
 * Assumes average city driving speed of 30 km/h
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} ETA in minutes
 */
export function calculateETA(distanceKm) {
  const avgSpeedKmH = 30; // 30 km per hour in city traffic
  const timeHours = distanceKm / avgSpeedKmH;
  return Math.ceil(timeHours * 60); // Convert to minutes and round up
}

/**
 * Blood group compatibility map.
 * For emergency transfusions, exact match is safest.
 * This map also includes compatible donor types for each recipient.
 */
const BLOOD_COMPATIBILITY = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

/**
 * Find matching donors for a blood request.
 * 
 * Filters donors by:
 * 1. Exact blood group match (primary) or compatible types
 * 2. Within MAX_RADIUS_KM distance
 * 3. Currently available
 * 
 * Results are sorted by distance (nearest first).
 * 
 * @param {Object} request - The blood request object
 * @param {Array} donors - Array of all donor objects
 * @param {boolean} exactMatchOnly - If true, only match exact blood groups
 * @returns {Array} Matched donors with distance info, sorted nearest first
 */
export function findMatchingDonors(request, donors, exactMatchOnly = true) {
  if (!request || !donors || !request.location) return [];

  const { bloodGroup, location } = request;
  const { lat, lng } = location;

  // Get compatible blood groups
  const compatibleGroups = exactMatchOnly
    ? [bloodGroup]
    : (BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup]);

  const matched = donors
    .filter(donor => {
      // Must be available
      if (!donor.available) return false;

      // Must have matching blood group
      if (!compatibleGroups.includes(donor.bloodGroup)) return false;

      // Must have valid location
      if (!donor.location || !donor.location.lat || !donor.location.lng) return false;

      return true;
    })
    .map(donor => {
      // Calculate distance from hospital
      const distance = calculateDistance(
        lat, lng,
        donor.location.lat, donor.location.lng
      );

      return {
        ...donor,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        eta: calculateETA(distance), // Calculate ETA
      };
    })
    // Filter by radius
    .filter(donor => donor.distance <= MAX_RADIUS_KM)
    // Sort by distance (nearest first)
    .sort((a, b) => a.distance - b.distance);

  return matched;
}

/**
 * Get urgency level details for display
 * @param {string} urgency - 'Critical' | 'Urgent' | 'Normal'
 * @returns {Object} Display properties
 */
export function getUrgencyDetails(urgency) {
  switch (urgency) {
    case 'Critical':
      return {
        label: 'CRITICAL',
        className: 'badge-critical',
        icon: '🔴',
        priority: 3,
      };
    case 'Urgent':
      return {
        label: 'URGENT',
        className: 'badge-urgent',
        icon: '🟠',
        priority: 2,
      };
    default:
      return {
        label: 'NORMAL',
        className: 'badge-normal',
        icon: '🟢',
        priority: 1,
      };
  }
}

/**
 * Get status display details
 * @param {string} status - 'Pending' | 'Donor Assigned' | 'Completed'
 * @returns {Object} Display properties
 */
export function getStatusDetails(status) {
  switch (status) {
    case 'Pending':
      return { label: 'Pending', className: 'badge-pending', icon: '⏳' };
    case 'Donor Assigned':
      return { label: 'Donor Assigned', className: 'badge-assigned', icon: '✅' };
    case 'Completed':
      return { label: 'Completed', className: 'badge-completed', icon: '🎉' };
    default:
      return { label: status, className: 'badge-pending', icon: '📋' };
  }
}
