export type User = {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export type Subscription = {
  id: string;
  user_id: string;
  service_name: string;
  cost: number;
  currency: string;
  billing_frequency: string;
  next_billing_date: string;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type Settings = {
  user_id: string;
  language: string;
  currency: string;
  notification_lead_time: number;
  created_at: string;
  updated_at: string;
} 