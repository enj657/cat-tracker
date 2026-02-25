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
  users?: User[];
}