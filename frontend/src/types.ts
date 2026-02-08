export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Visit {
  id: number;
  visit_type: string;
  date: string;
  notes: string;
}

export interface Reminder {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
}

export interface Photo {
  id: number;
  cat_id: number;
  image_url: string;
  display_url?: string;
  caption: string;
  created_at: string;
  updated_at: string;
}
export interface Cat {
  id: number;
  name: string;
  age: number;
  breed?: string;
  users?: User[];
  visits?: Visit[];
  reminders?: Reminder[];
  photos?: Photo[];
}
