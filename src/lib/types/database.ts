export type UserRole = "member" | "leader" | "pastor" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  cpf: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  ministries: string[];
  role: UserRole;
  is_active: boolean;
  member_since: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  image_url: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PrayerRequest = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  is_answered: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Pick<Profile, "full_name" | "avatar_url">;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Banner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type FileResource = {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: "sermon" | "devotional" | "cell" | "general";
  is_published: boolean;
  uploaded_by: string | null;
  created_at: string;
};

export type Tithe = {
  id: string;
  user_id: string | null;
  amount: number;
  type: "tithe" | "offering" | "campaign";
  description: string | null;
  payment_method: string;
  receipt_url: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

export type FinancialCategory = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  type: "income" | "expense";
  category_id: string | null;
  amount: number;
  description: string;
  payment_method: "pix" | "cash" | "card" | "transfer" | "check" | "other";
  reference_date: string;
  responsible_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  financial_categories?: Pick<FinancialCategory, "name" | "color"> | null;
  responsible?: Pick<Profile, "full_name"> | null;
  creator?: Pick<Profile, "full_name"> | null;
};
