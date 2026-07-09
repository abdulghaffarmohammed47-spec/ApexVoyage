/* ═══════════════════════════════════════════════════════════════
   InteractiveMap — React-Leaflet with CartoDB Dark Matter Tiles
   Smooth panning transitions when coordinates change
   ═══════════════════════════════════════════════════════════════ */

import { memo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet Default Marker Icons for Bundled Environments ───
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Custom Cyan Marker Icon ───
const cyanIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Internal Observer: Smooth Pan to New Coordinates ───
function MapPanObserver({ lat, lon }) {
  const map = useMap();

  useEffect(() => {
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      map.flyTo([lat, lon], map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [lat, lon, map]);

  return null;
}

// ─── Main InteractiveMap Component ───
const InteractiveMap = memo(function InteractiveMap({
  lat = 48.8566,
  lon = 2.3522,
  zoom = 13,
  markerLabel = 'Location',
  height = '100%',
}) {
  const safeLatitude = typeof lat === 'number' && isFinite(lat) ? lat : 48.8566;
  const safeLongitude = typeof lon === 'number' && isFinite(lon) ? lon : 2.3522;

  return (
    <div className="map-container" style={{ height, minHeight: '300px' }}>
      <MapContainer
        center={[safeLatitude, safeLongitude]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }}
        zoomControl={true}
      >
        {/* CartoDB Dark Matter Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Smooth Panning Observer */}
        <MapPanObserver lat={safeLatitude} lon={safeLongitude} />

        {/* Location Marker */}
        <Marker position={[safeLatitude, safeLongitude]} icon={cyanIcon}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem' }}>
              📍 {markerLabel}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
});

export default InteractiveMap;
