export type RoomType =
  | 'bedroom'
  | 'living'
  | 'kitchen'
  | 'bathroom'
  | 'dining'
  | 'utility'
  | 'garage'
  | 'corridor'
  | 'other';

export interface FloorRoom {
  name: string;
  width_m: number;
  height_m: number;
  floor: number;
  type: RoomType;
  x_m?: number;  // AI-provided X position (metres from left)
  y_m?: number;  // AI-provided Y position (metres from top)
}

export interface Project {
  id: string;
  user_id: string;
  plot_size: string;
  floors: number;
  style: string;
  plan_description: string | null;
  estimated_cost: number | null;
  pdf_url: string | null;
  floor_plan_json: string | null;
  created_at: string;
}

export interface CostBreakdown {
  total: number;
  materials: number;
  labor: number;
  other: number;
}

export interface GeneratePlanRequest {
  projectId: string;
  plot_size: string;
  floors: number;
  style: string;
}

export interface EstimateCostRequest {
  projectId: string;
  plot_size: string;
  floors: number;
}

export interface GeneratePdfRequest {
  projectId: string;
}

export interface ApiError {
  error: string;
}
