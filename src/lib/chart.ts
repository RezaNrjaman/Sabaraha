export interface SeriesConfig {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

export interface TrendPoint {
  tanggal: string;
  [key: string]: string | number | null;
}
