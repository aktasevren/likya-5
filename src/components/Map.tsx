'use client';

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackPoint {
  name: string;
  yukseklik: number;
  sure: number;
  lat: number;
  lng: number;
  mesafe: number;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  trackData: TrackPoint[];
}

// Harita bileşeni için özel hook
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current) {
      map.setView(center, zoom);
    }
    isFirstRender.current = false;
  }, [center, zoom, map]);

  return null;
}

export default function Map({ center, zoom, trackData }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Leaflet ikonları için düzeltme
    delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      whenReady={() => {
        if (mapRef.current) {
          mapRef.current = mapRef.current;
        }
      }}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline
        positions={trackData.map(point => [point.lat, point.lng])}
        color="#8884d8"
        weight={3}
      />
    </MapContainer>
  );
} 