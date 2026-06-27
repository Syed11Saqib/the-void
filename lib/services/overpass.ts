import type { Coordinates, Hospital } from '@/lib/types';

const OVERPASS_URL =
  process.env.NEXT_PUBLIC_OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function isGovernment(tags: Record<string, string> = {}): boolean {
  const op = (tags.operator_type || tags.operator || '').toLowerCase();
  const amenityGov = tags['amenity:type'] === 'government';
  return (
    op.includes('government') ||
    op.includes('public') ||
    op.includes('govt') ||
    amenityGov ||
    tags.healthcare === 'hospital'
  );
}

/**
 * Queries Overpass for hospitals within radiusMeters of the given coordinates.
 * Returns hospitals sorted by distance, tagged as 'government' when detectable.
 */
export async function findNearbyHospitals(
  coords: Coordinates,
  radiusMeters = 8000
): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${coords.lat},${coords.lon});
      way["amenity"="hospital"](around:${radiusMeters},${coords.lat},${coords.lon});
    );
    out center tags;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data: { elements: OverpassElement[] } = await response.json();

  const hospitals: Hospital[] = data.elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;
      const tags = el.tags || {};
      const distanceKm = haversineKm(coords, { lat, lon });
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
      ].filter(Boolean);

      const hospital: Hospital = {
        id: String(el.id),
        name: tags.name || 'Unnamed Hospital',
        lat,
        lon,
        distanceKm: Math.round(distanceKm * 10) / 10,
        address: addressParts.join(', ') || undefined,
        phone: tags.phone || tags['contact:phone'],
        type: isGovernment(tags) ? 'government' : 'unspecified',
      };
      return hospital;
    })
    .filter((h): h is Hospital => h !== null)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  // Government hospitals first, then by distance.
  return hospitals.sort((a, b) => {
    if (a.type === b.type) return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
    return a.type === 'government' ? -1 : 1;
  });
}

/**
 * Geocodes a city name to coordinates using Nominatim (OSM's free geocoder),
 * used as a fallback when GPS permission is denied.
 */
export async function geocodeCity(cityName: string): Promise<Coordinates | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cityName
  )}&limit=1`;

  const response = await fetch(url, {
    headers: { 'Accept-Language': 'en' },
  });

  if (!response.ok) return null;

  const results: { lat: string; lon: string }[] = await response.json();
  if (!results.length) return null;

  return { lat: parseFloat(results[0]!.lat), lon: parseFloat(results[0]!.lon) };
}
