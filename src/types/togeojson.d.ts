declare module '@mapbox/togeojson' {
  interface GeoJSONFeature {
    type: string;
    properties: Record<string, string | number | boolean>;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }

  interface GeoJSON {
    type: string;
    features: GeoJSONFeature[];
  }

  const toGeoJSON: {
    gpx: (doc: Document) => GeoJSON;
  };

  export default toGeoJSON;
} 