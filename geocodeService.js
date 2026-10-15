const axios = require('axios');

// Simple delay helper to respect Nominatim rate limit (1 req/sec)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastGeocodeTime = 0;

/**
 * Geocode a location using Nominatim OpenStreetMap (free, no key required)
 * @returns { latitude, longitude, displayName } or null
 */
const geocodeLocation = async (village, mandal, district, state = 'Andhra Pradesh', pinCode = '') => {
  // Enforce 1 second between calls
  const now = Date.now();
  const timeSinceLast = now - lastGeocodeTime;
  if (timeSinceLast < 1100) {
    await delay(1100 - timeSinceLast);
  }
  lastGeocodeTime = Date.now();

  // Build queries from most specific to least specific
  const queries = [];
  if (village && mandal && district) {
    queries.push(`${village}, ${mandal}, ${district}, ${state}, India`);
  }
  if (mandal && district) {
    queries.push(`${mandal}, ${district}, ${state}, India`);
  }
  if (pinCode) {
    queries.push(`${pinCode}, ${state}, India`);
  }
  queries.push(`${district}, ${state}, India`);

  for (const query of queries) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          format: 'json',
          q: query,
          addressdetails: 1,
          limit: 1,
          countrycodes: 'in',
        },
        headers: {
          'User-Agent': 'GeoAI-Rural-Platform/1.0 (government-platform@ap.gov.in)',
          'Accept-Language': 'en',
        },
        timeout: 10000,
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          displayName: result.display_name,
        };
      }
    } catch (error) {
      console.warn(`Geocoding failed for query "${query}":`, error.message);
    }
    // Wait before trying next query
    await delay(1100);
  }

  return null;
};

module.exports = { geocodeLocation };
