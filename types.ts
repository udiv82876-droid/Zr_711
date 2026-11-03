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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      access_events: {
        Row: {
          browser: string | null
          browser_version: string | null
          city: string | null
          country: string | null
          created_at: string
          device_label: string | null
          device_type: string | null
          event_type: string
          file_id: string | null
          file_name: string | null
          hash_verified: boolean | null
          id: string
          ip: string | null
          is_bot: boolean
          language: string | null
          os: string | null
          os_version: string | null
          referrer: string | null
          region: string | null
          screen: string | null
          timezone: string | null
          token: string
          user_agent: string | null
          visit_id: string | null
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_label?: string | null
          device_type?: string | null
          event_type: string
          file_id?: string | null
          file_name?: string | null
          hash_verified?: boolean | null
          id?: string
          ip?: string | null
          is_bot?: boolean
          language?: string | null
          os?: string | null
          os_version?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          timezone?: string | null
          token: string
          user_agent?: string | null
          visit_id?: string | null
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_label?: string | null
          device_type?: string | null
          event_type?: string
          file_id?: string | null
          file_name?: string | null
          hash_verified?: boolean | null
          id?: string
          ip?: string | null
          is_bot?: boolean
          language?: string | null
          os?: string | null
          os_version?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          timezone?: string | null
          token?: string
          user_agent?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_events_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_events_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          file_id: string | null
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          file_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          file_id?: string | null
          id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string
          event_id: string
          event_type: string
          file_id: string | null
          file_name: string | null
          id: string
          read_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          event_id: string
          event_type: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          read_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "access_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_access_state: {
        Row: {
          blocked: boolean
          id: number
          message: string | null
          status: number | null
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          id?: number
          message?: string | null
          status?: number | null
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          id?: number
          message?: string | null
          status?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      download_receipts: {
        Row: {
          completed_at: string | null
          created_at: string
          file_id: string
          id: string
          sha256: string
          visit_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          file_id: string
          id?: string
          sha256: string
          visit_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          file_id?: string
          id?: string
          sha256?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_receipts_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file_counters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_receipts_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          allow_preview: boolean
          ask_device_label: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          display_name: string
          expires_at: string | null
          extension: string | null
          file_date: string | null
          id: string
          image_height: number | null
          image_width: number | null
          last_modified_at: string | null
          mime_type: string
          original_name: string
          preview_path: string | null
          sha256: string
          sha256_verified_by_server: boolean
          size_bytes: number
          status: string
          status_changed_at: string | null
          status_changed_by: string | null
          storage_path: string
          thumbnail_path: string | null
          token: string
          updated_at: string
          version: number
        }
        Insert: {
          allow_preview?: boolean
          ask_device_label?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_name: string
          expires_at?: string | null
          extension?: string | null
          file_date?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          last_modified_at?: string | null
          mime_type?: string
          original_name: string
          preview_path?: string | null
          sha256: string
          sha256_verified_by_server?: boolean
          size_bytes: number
          status?: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          storage_path: string
          thumbnail_path?: string | null
          token: string
          updated_at?: string
          version?: number
        }
        Update: {
          allow_preview?: boolean
          ask_device_label?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          display_name?: string
          expires_at?: string | null
          extension?: string | null
          file_date?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          last_modified_at?: string | null
          mime_type?: string
          original_name?: string
          preview_path?: string | null
          sha256?: string
          sha256_verified_by_server?: boolean
          size_bytes?: number
          status?: string
          status_changed_at?: string | null
          status_changed_by?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          token?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string
          display_timezone: string
          id: string
          notifications_enabled: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string
          display_timezone?: string
          id: string
          notifications_enabled?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          display_timezone?: string
          id?: string
          notifications_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          blocked_extensions: string
          collect_geo: boolean
          collect_ip: boolean
          id: number
          log_retention_days: number
          logo_url: string | null
          max_file_mb: number
          primary_hue: number
          privacy_text: string | null
          public_base_url: string | null
          site_name: string
          updated_at: string
        }
        Insert: {
          blocked_extensions?: string
          collect_geo?: boolean
          collect_ip?: boolean
          id?: number
          log_retention_days?: number
          logo_url?: string | null
          max_file_mb?: number
          primary_hue?: number
          privacy_text?: string | null
          public_base_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Update: {
          blocked_extensions?: string
          collect_geo?: boolean
          collect_ip?: boolean
          id?: number
          log_retention_days?: number
          logo_url?: string | null
          max_file_mb?: number
          primary_hue?: number
          privacy_text?: string | null
          public_base_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      file_counters: {
        Row: {
          downloads: number | null
          downloads_completed: number | null
          id: string | null
          unique_visits: number | null
          visits: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
