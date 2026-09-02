export interface Station {
  id: string;          // 稳定标识（收藏去重用）
  name: string;
  freq: number;        // 0 = 无公开频率（显示 NET，指针按 99.0 落位）
  region: string;      // "中央" 或省级行政区名
  url: string;         // 直播流（仅 https）
  backup?: string;     // 备用流
  safariOnly?: boolean; // 源无 CORS：仅 Safari 原生 HLS 可播（iOS 全支持）
}
