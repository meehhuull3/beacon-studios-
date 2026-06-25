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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      broadcasts: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          target_college_ids: string[]
          target_roles: Database["public"]["Enums"]["app_role"][]
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          target_college_ids?: string[]
          target_roles?: Database["public"]["Enums"]["app_role"][]
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          target_college_ids?: string[]
          target_roles?: Database["public"]["Enums"]["app_role"][]
          title?: string
        }
        Relationships: []
      }
      colleges: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location: string | null
          mou_signed_at: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          mou_signed_at?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          mou_signed_at?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendees: number | null
          college_id: string
          created_at: string
          created_by: string | null
          id: string
          mentor: string | null
          report: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          attendees?: number | null
          college_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          mentor?: string | null
          report?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          attendees?: number | null
          college_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          mentor?: string | null
          report?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          college_id?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          college_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          college_id: string
          created_at: string
          end_date: string
          enrolled_students: number
          id: string
          name: string
          notes: string | null
          phase: Database["public"]["Enums"]["program_phase"]
          start_date: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          end_date: string
          enrolled_students?: number
          id?: string
          name: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["program_phase"]
          start_date: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          end_date?: string
          enrolled_students?: number
          id?: string
          name?: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["program_phase"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_requests: {
        Row: {
          college_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          position: Database["public"]["Enums"]["core_team_position"] | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["signup_status"]
          user_id: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          position?: Database["public"]["Enums"]["core_team_position"] | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["signup_status"]
          user_id: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: Database["public"]["Enums"]["core_team_position"] | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["signup_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signup_requests_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          college_id: string
          created_at: string
          created_by: string | null
          description: string | null
          domain: string | null
          faculty_id: string | null
          id: string
          last_update: string
          members: string | null
          name: string
          revenue: number | null
          stage: Database["public"]["Enums"]["startup_stage"]
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          faculty_id?: string | null
          id?: string
          last_update?: string
          members?: string | null
          name: string
          revenue?: number | null
          stage?: Database["public"]["Enums"]["startup_stage"]
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          faculty_id?: string | null
          id?: string
          last_update?: string
          members?: string | null
          name?: string
          revenue?: number | null
          stage?: Database["public"]["Enums"]["startup_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "startups_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string
          assigner_id: string
          college_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          assigner_id: string
          college_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          assigner_id?: string
          college_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          position: Database["public"]["Enums"]["core_team_position"] | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          position?: Database["public"]["Enums"]["core_team_position"] | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          position?: Database["public"]["Enums"]["core_team_position"] | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      user_college: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "faculty" | "core_team"
      core_team_position:
        | "president"
        | "vice_president"
        | "marketing"
        | "tech"
        | "operations"
      event_status: "upcoming" | "live" | "completed" | "cancelled"
      event_type: "event" | "podcast" | "talk" | "workshop"
      program_phase: "genesis" | "fellowship" | "accelerator"
      signup_status: "pending" | "approved" | "rejected"
      startup_stage: "ideation" | "validating" | "mvp_live" | "revenue"
      task_status: "pending" | "in_progress" | "done"
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
    Enums: {
      app_role: ["admin", "faculty", "core_team"],
      core_team_position: [
        "president",
        "vice_president",
        "marketing",
        "tech",
        "operations",
      ],
      event_status: ["upcoming", "live", "completed", "cancelled"],
      event_type: ["event", "podcast", "talk", "workshop"],
      program_phase: ["genesis", "fellowship", "accelerator"],
      signup_status: ["pending", "approved", "rejected"],
      startup_stage: ["ideation", "validating", "mvp_live", "revenue"],
      task_status: ["pending", "in_progress", "done"],
    },
  },
} as const
