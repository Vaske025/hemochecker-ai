
export interface BloodTest {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  processed: boolean;
}

export interface BloodTestMetric {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "elevated" | "low";
}

export interface BloodTestReport {
  id: string;
  date: string;
  name: string;
  metrics: BloodTestMetric[];
}

export interface HealthScore {
  date: string;
  score: number;
}
