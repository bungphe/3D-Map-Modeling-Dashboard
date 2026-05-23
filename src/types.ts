export interface PointOfInterest {
  name: string;
  type: "weather" | "industrial" | "sensor" | "traffic" | "residential" | "ecological";
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  value: string;
  status: "active" | "warning" | "error";
}

export interface ChartRecord {
  name: string;
  sanLuong: number;
  nangLuong: number;
  chitieu: number;
}

export interface MapMetrics {
  totalArea: string;
  averageHeight: string;
  activeSensors: number;
  weatherStatus: string;
}

export interface MapData {
  regionName: string;
  metrics: MapMetrics;
  heightGrid: number[][]; // 10x10 height points (0 to 100)
  pointsOfInterest: PointOfInterest[];
  chartData: ChartRecord[];
  warnings: string[];
}

export interface PresetMap {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // generated canvas placeholder or design
  mapType: "Image Map" | "DWG Draft";
  previewUrl: string; // custom base64-like texture representation
  data: MapData;
}
