'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';

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

export default function Map({ center, zoom, trackData }: MapProps) {
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [TileLayerComponent, setTileLayerComponent] = useState<any>(null);
  const [PolylineComponent, setPolylineComponent] = useState<any>(null);
  const [useMapHook, setUseMapHook] = useState<any>(null);
  const [Leaflet, setLeaflet] = useState<any>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      const L = (await import('leaflet')).default;
      const { MapContainer, TileLayer, Polyline, useMap } = await import('react-leaflet');
      await import('leaflet/dist/leaflet.css');

      setLeaflet(L);
      setMapComponent(MapContainer);
      setTileLayerComponent(TileLayer);
      setPolylineComponent(Polyline);
      setUseMapHook(useMap);

      // Leaflet ikonları için düzeltme
      delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    };

    loadComponents();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  if (!MapComponent || !TileLayerComponent || !PolylineComponent || !useMapHook) {
    return (
      <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    );
  }

  // Harita bileşeni için özel hook
  function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMapHook();
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (!isFirstRender.current) {
        map.setView(center, zoom);
      }
      isFirstRender.current = false;
    }, [center, zoom, map]);

    return null;
  }

  return (
    <MapComponent
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
      <TileLayerComponent
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <PolylineComponent
        positions={trackData.map(point => [point.lat, point.lng])}
        color="#8884d8"
        weight={3}
      />
    </MapComponent>
  );
} 