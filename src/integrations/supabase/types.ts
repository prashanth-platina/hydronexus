export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_logs: {
        Row: {
          alert_level: string
          alert_type: string
          created_at: string
          id: number
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          water_source_id: number | null
        }
        Insert: {
          alert_level: string
          alert_type: string
          created_at?: string
          id?: number
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          water_source_id?: number | null
        }
        Update: {
          alert_level?: string
          alert_type?: string
          created_at?: string
          id?: number
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          water_source_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_logs_water_source_id_fkey"
            columns: ["water_source_id"]
            isOneToOne: false
            referencedRelation: "water_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_predictions: {
        Row: {
          confidence: number | null
          created_at: string
          id: number
          model_version: string | null
          prediction_data: Json | null
          risk_level: string
          water_source_id: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: number
          model_version?: string | null
          prediction_data?: Json | null
          risk_level: string
          water_source_id?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: number
          model_version?: string | null
          prediction_data?: Json | null
          risk_level?: string
          water_source_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_predictions_water_source_id_fkey"
            columns: ["water_source_id"]
            isOneToOne: false
            referencedRelation: "water_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          bacterial_count: number | null
          chlorine_level: number | null
          created_at: string
          dissolved_oxygen: number | null
          id: number
          location: string
          ph_level: number | null
          temperature: number | null
          turbidity: number | null
          water_source_id: number | null
        }
        Insert: {
          bacterial_count?: number | null
          chlorine_level?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          id?: number
          location: string
          ph_level?: number | null
          temperature?: number | null
          turbidity?: number | null
          water_source_id?: number | null
        }
        Update: {
          bacterial_count?: number | null
          chlorine_level?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          id?: number
          location?: string
          ph_level?: number | null
          temperature?: number | null
          turbidity?: number | null
          water_source_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_water_source_id_fkey"
            columns: ["water_source_id"]
            isOneToOne: false
            referencedRelation: "water_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: number
          organization: string | null
          phone_number: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: number
          organization?: string | null
          phone_number?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: number
          organization?: string | null
          phone_number?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      water_sources: {
        Row: {
          created_at: string
          id: number
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          source_type: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: number
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          source_type?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: number
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          source_type?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
