// ============================================================
// Deen Assist — Nearby Mosques/Suraus & Halal Food
// Data: OpenStreetMap via the free Overpass API (no key required).
// https://overpass-api.de
// ============================================================

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_M = 5000;

let currentCategory = "mosque";
let lastCoords = null;

function nEl(id) {
  return document.getElementById(id);
}

function nEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildQuery(category, lat, lon) {
  if (category === "mosque") {
    return `[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_M},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_M},${lat},${lon});
);
out center 40;`;
  }
  return `[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|fast_food|cafe)$"]["diet:halal"~"yes|only"](around:${SEARCH_RADIUS_M},${lat},${lon});
  node["amenity"~"^(restaurant|fast_food|cafe)$"]["name"~"halal",i](around:${SEARCH_RADIUS_M},${lat},${lon});
  way["amenity"~"^(restaurant|fast_food|cafe)$"]["diet:halal"~"yes|only"](around:${SEARCH_RADIUS_M},${lat},${lon});
);
out center 40;`;
}

function placeName(tags, category) {
  if (tags.name) return tags.name;
  if (category === "mosque") {
    return tags.place_of_worship === "musalla" ? "Surau / Musalla" : "Mosque";
  }
  return "Halal Restaurant";
}

function placeAddress(tags) {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
  return parts.join(", ");
}

async function search(category) {
  currentCategory = category;
  const listEl = nEl("nearby-results");
  const statusEl = nEl("nearby-status");

  nEl("nearby-tab-mosque").classList.toggle("active", category === "mosque");
  nEl("nearby-tab-halal").classList.toggle("active", category === "halal");

  if (!navigator.geolocation) {
    statusEl.textContent = "Location not supported on this device.";
    listEl.innerHTML = "";
    return;
  }

  statusEl.textContent = "Getting your location…";
  listEl.innerHTML = "";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      lastCoords = { latitude, longitude };
      statusEl.textContent = "Searching nearby…";

      try {
        const query = buildQuery(category, latitude, longitude);
        const res = await fetch(OVERPASS_URL, {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`
        });
        const json = await res.json();
        renderResults(json.elements || [], latitude, longitude, category);
      } catch (err) {
        statusEl.textContent = "Couldn't load nearby results. Check your connection and try again.";
        console.error("Overpass search failed:", err);
      }
    },
    () => {
      statusEl.textContent = "Location permission denied. Enable it in device settings to find nearby places.";
    }
  );
}

function renderResults(elements, lat, lon, category) {
  const listEl = nEl("nearby-results");
  const statusEl = nEl("nearby-status");

  const places = elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat == null || elLon == null) return null;
      return {
        name: placeName(el.tags || {}, category),
        address: placeAddress(el.tags || {}),
        lat: elLat,
        lon: elLon,
        distance: distanceKm(lat, lon, elLat, elLon)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);

  if (!places.length) {
    statusEl.textContent = `No ${category === "mosque" ? "mosques/suraus" : "halal food places"} found within ${SEARCH_RADIUS_M / 1000}km. Map data may be incomplete in this area.`;
    listEl.innerHTML = "";
    return;
  }

  statusEl.textContent = `${places.length} found within ${SEARCH_RADIUS_M / 1000}km, nearest first:`;
  listEl.innerHTML = places
    .map(
      (p) => `
      <div class="card nearby-card">
        <div class="nearby-card-head">
          <span class="nearby-name">${nEscapeHtml(p.name)}</span>
          <span class="nearby-distance">${p.distance.toFixed(1)} km</span>
        </div>
        ${p.address ? `<p class="nearby-address">${nEscapeHtml(p.address)}</p>` : ""}
        <a class="small-btn nearby-directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank" rel="noopener">Directions</a>
      </div>`
    )
    .join("");
}

function initNearby() {
  nEl("nearby-tab-mosque").addEventListener("click", () => search("mosque"));
  nEl("nearby-tab-halal").addEventListener("click", () => search("halal"));
  search("mosque");
}

window.initNearby = initNearby;
