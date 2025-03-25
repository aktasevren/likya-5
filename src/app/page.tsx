'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import toGeoJSON from '@mapbox/togeojson';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Harita bileşenini dinamik olarak yükle
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Harita yükleniyor...</p>
    </div>
  ),
});

interface TrackPoint {
  name: string;
  yukseklik: number;
  sure: number;
  lat: number;
  lng: number;
  mesafe: number;
}

export default function Home() {
  const [trackData, setTrackData] = useState<TrackPoint[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.2, 29.6]); // Kaş'ın yaklaşık koordinatları
  const [mapZoom, setMapZoom] = useState(12);

  // İki nokta arasındaki mesafeyi hesaplayan yardımcı fonksiyon
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  useEffect(() => {
    const fetchGPX = async () => {
      try {
        const response = await fetch('/gpx/1.gpx');
        const gpxText = await response.text();
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
        const geoJSON = toGeoJSON.gpx(gpxDoc);

        if (geoJSON.features && geoJSON.features.length > 0) {
          const track = geoJSON.features[0];
          const coordinates = track.geometry.coordinates;
          let totalDistance = 0;
          const totalTime = 0; // Değişmeyecek değer olduğu için const kullanıyoruz

          const points: TrackPoint[] = coordinates.map((coord: number[], index: number) => {
            const [lon, lat, elevation] = coord;
            const distance = index === 0 ? 0 : calculateDistance(
              coordinates[index - 1][1],
              coordinates[index - 1][0],
              lat,
              lon
            );
            totalDistance += distance;

            // Her 100 metre veya önemli noktalarda bir veri noktası oluştur
            if (index === 0 || index === coordinates.length - 1 || totalDistance % 0.1 < 0.01) {
              return {
                name: `${(totalDistance).toFixed(1)}km`,
                yukseklik: Math.round(elevation),
                sure: Math.round(totalTime / 60),
                lat: lat,
                lng: lon,
                mesafe: Number(totalDistance.toFixed(1))
              };
            }
            return null;
          }).filter((point): point is TrackPoint => point !== null);

          setTrackData(points);

          // Harita merkezini ve zoom seviyesini ayarla
          if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            const center = bounds.getCenter();
            setMapCenter([center.lat, center.lng]);
            setMapZoom(12);
          }
        }
      } catch (error) {
        console.error('GPX dosyası okunamadı:', error);
      }
    };

    fetchGPX();
  }, [calculateDistance]);

  // Leaflet ikonları için düzeltme
  useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black">Likya Yolu - 1. Gün</h1>
        
        <div className="bg-gray-50 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">Rota Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-black"><strong>Başlangıç:</strong> Kaş</p>
              <p className="text-black"><strong>Bitiş:</strong> Üzümlü</p>
              <p className="text-black"><strong>Toplam Mesafe:</strong> 13.89 km</p>
              <p className="text-black"><strong>Zorluk Seviyesi:</strong> Zor</p>
              <p className="text-black"><strong>Hareket Süresi:</strong> 4 saat 4 dakika</p>
              <p className="text-black"><strong>Toplam Süre:</strong> 6 saat 1 dakika</p>
              <p className="text-black"><strong>TrailRank:</strong> 76/5</p>
            </div>
            <div>
              <p className="text-black"><strong>İrtifa Kazancı:</strong> 450m</p>
              <p className="text-black"><strong>İrtifa Kaybı:</strong> 443m</p>
              <p className="text-black"><strong>Maksimum İrtifa:</strong> 118m</p>
              <p className="text-black"><strong>Minimum İrtifa:</strong> 0m</p>
              <p className="text-black"><strong>Parkur Türü:</strong> Tek Yönlü</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">Rota Profili</h2>
            <div className="h-[400px] sm:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trackData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#000"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#000"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    formatter={(value: number) => [`${value}m`, 'Yükseklik']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="yukseklik"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Yükseklik (m)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">Rota Haritası</h2>
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              trackData={trackData}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
