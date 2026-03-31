export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Photo {
  id: number;
  image_url: string;
  display_url?: string;
  caption?: string;
  profile_photo?: boolean;
}

export interface Visit {
  id: number;
  visit_type: string;
  date: string;
  notes?: string;
  completed: boolean;
}

export interface Reminder {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
}

export interface Weight {
  id: number;
  weight: number;
  date: string;
  notes?: string;
}

export interface BehaviorLog {
  id: number;
  date: string;
  category: string;
  severity: string;
  description?: string;
}

export interface GroomingLog {
  id: number;
  date: string;
  grooming_type: string;
  performed_by?: string;
  next_due_date?: string;
  notes?: string;
}

export interface FleaTreatment {
  id: number;
  date: string;
  product_name?: string;
  treatment_type: string;
  next_due_date?: string;
  notes?: string;
}

export interface FoodLog {
  id: number;
  date: string;
  food_brand?: string;
  food_type?: string;
  prescription?: boolean;
  is_food_change?: boolean;
  previous_brand?: string;
  reaction?: string;
  notes?: string;
}

export interface LitterBoxLog {
  id: number;
  date: string;
  action: string;
  has_issue?: boolean;
  litter_brand?: string;
  notes?: string;
}

export interface Cat {
  id: number;
  name: string;
  age?: number;
  breed?: string;
  birthday?: string;
  photos?: Photo[];
  visits?: Visit[];
  reminders?: Reminder[];
  weights?: Weight[];
  behavior_logs?: BehaviorLog[];
  grooming_logs?: GroomingLog[];
  flea_treatments?: FleaTreatment[];
  food_logs?: FoodLog[];
  litter_box_logs?: LitterBoxLog[];
  users?: User[];
}