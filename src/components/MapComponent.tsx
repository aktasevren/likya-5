'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

interface TrackPoint {
  name: string;
  yukseklik: number;
  sure: number;
  lat: number;
  lng: number;
  mesafe: number;
}

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  trackData: TrackPoint[];
}

// Leaflet haritasını dinamik olarak yükle
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Harita yükleniyor...</p>
    </div>
  ),
});

export default function MapComponent({ center, zoom, trackData }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Harita yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden">
      <Map center={center} zoom={zoom} trackData={trackData} />
    </div>
  );
} 