/* =============================================
   Quexy — Frontend TypeScript Types
   Mirrors the backend response models exactly.
   ============================================= */

export interface KPICard {
  title: string;
  value: string | number;
  change?: string | null;
  trend: 'up' | 'down' | 'neutral';
  icon?: string | null;
  prefix?: string;
  suffix?: string;
}

export interface ChartData {
  chart_type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Record<string, any>[];
  x_key: string;
  y_keys: string[];
  colors?: string[] | null;
  x_label?: string;
  y_label?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: string;
}

export interface TableData {
  title: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
  sortable?: boolean;
  pagination?: boolean;
  page_size?: number;
}

export interface InsightItem {
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'info' | 'warning';
  icon?: string | null;
}

export interface RecommendationItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PerformanceAdvice {
  type: 'warning' | 'info' | 'success';
  message: string;
  action_sql?: string | null;
}

export interface PerformanceReport {
  original_sql: string;
  corrected_sql?: string | null;
  ast_corrected: boolean;
  explain_plan: string[];
  advice: PerformanceAdvice[];
}

export interface QueryResponse {
  query_id: string;
  question: string;
  summary: string;
  kpi_cards: KPICard[];
  charts: ChartData[];
  tables: TableData[];
  insights: InsightItem[];
  recommendations: RecommendationItem[];
  success: boolean;
  error?: string | null;
  timestamp: string;
  execution_time_ms: number;
  performance_report?: PerformanceReport | null;
}

export interface QueryHistoryItem {
  query_id: string;
  question: string;
  summary: string;
  timestamp: string;
  has_kpis: boolean;
  has_charts: boolean;
  has_tables: boolean;
  has_insights: boolean;
}

export interface TableInfo {
  name: string;
  columns: number;
  rows: number | string;
  column_names: string[];
}

export interface ConnectionStatus {
  connected: boolean;
  source_name: string | null;
  source_type: string | null;
  dialect?: string;
  tables: TableInfo[];
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
