export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = 'student' | 'provider' | 'admin';
export type UserPlan = 'free' | 'plus' | 'pro';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          plan: UserPlan;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          university: string | null;
          major: string | null;
          bio: string | null;
          city: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          gender: string | null;
          gender_preference: string | null;
          phone: string | null;
          preferences: string[];
          is_looking_for_roommate: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['student_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
      };
      provider_profiles: {
        Row: {
          id: string;
          user_id: string;
          service_title: string | null;
          service_category: string | null;
          bio: string | null;
          city: string | null;
          rate: string | null;
          rate_type: string;
          tags: string[];
          is_available: boolean;
          is_verified: boolean;
          rating: number;
          total_reviews: number;
          total_completed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['provider_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['provider_profiles']['Insert']>;
      };
      roommate_preferences: {
        Row: {
          id: string;
          user_id: string;
          university: string | null;
          city: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          gender_preference: string;
          lifestyle_tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['roommate_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['roommate_preferences']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          category: string;
          description: string | null;
          rate: number | null;
          rate_type: string;
          tags: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      food_plans: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          cuisine: string | null;
          diet_type: string;
          description: string | null;
          price_per_meal: number | null;
          price_per_month: number | null;
          delivery_days: string[];
          is_active: boolean;
          is_verified: boolean;
          rating: number;
          total_reviews: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['food_plans']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['food_plans']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          student_id: string;
          provider_id: string;
          service_type: string;
          service_name: string;
          scheduled_date: string | null;
          status: BookingStatus;
          price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          provider_id: string;
          booking_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      community_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          likes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          student_id: string;
          plan: UserPlan;
          status: SubscriptionStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          is_read: boolean;
          data: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}
