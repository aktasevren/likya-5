declare module '@mapbox/togeojson' {
  interface GeoJSONFeature {
    type: string;
    properties: any;
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