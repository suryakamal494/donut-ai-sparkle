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
      notification_logs: {
        Row: {
          body: string | null
          error_message: string | null
          id: string
          sent_at: string
          status: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      router_decisions: {
        Row: {
          confidence: number | null
          created_at: string
          decision: string
          id: string
          message_preview: string | null
          scope_key: string | null
          student_id: string
          thread_id: string | null
          tool: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          decision: string
          id?: string
          message_preview?: string | null
          scope_key?: string | null
          student_id: string
          thread_id?: string | null
          tool?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          decision?: string
          id?: string
          message_preview?: string | null
          scope_key?: string | null
          student_id?: string
          thread_id?: string | null
          tool?: string | null
        }
        Relationships: []
      }
      rp_artifacts: {
        Row: {
          batch_id: string
          content: Json
          created_at: string
          id: string
          thread_id: string | null
          title: string
          type: string
        }
        Insert: {
          batch_id: string
          content?: Json
          created_at?: string
          id?: string
          thread_id?: string | null
          title: string
          type: string
        }
        Update: {
          batch_id?: string
          content?: Json
          created_at?: string
          id?: string
          thread_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_artifacts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "rp_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_artifacts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "rp_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_batches: {
        Row: {
          created_at: string
          grade: string
          id: string
          name: string
          section: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          name: string
          section?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          name?: string
          section?: string | null
          subject?: string
        }
        Relationships: []
      }
      rp_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "rp_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_routines: {
        Row: {
          audience: string
          created_at: string
          default_system_prompt: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean
          key: string
          label: string
          quick_start_chips: string[] | null
          sort_order: number
        }
        Insert: {
          audience?: string
          created_at?: string
          default_system_prompt?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          quick_start_chips?: string[] | null
          sort_order?: number
        }
        Update: {
          audience?: string
          created_at?: string
          default_system_prompt?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          quick_start_chips?: string[] | null
          sort_order?: number
        }
        Relationships: []
      }
      rp_threads: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          last_message_at: string
          routine_id: string
          title: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          routine_id: string
          title: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          routine_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_threads_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "rp_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_threads_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "rp_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attempts: {
        Row: {
          artifact_id: string | null
          correct: boolean
          created_at: string
          expected_answer: string | null
          given_answer: string | null
          id: string
          question_text: string | null
          question_type: string
          source: string
          student_id: string
          subject: string | null
          thread_id: string | null
          time_seconds: number | null
          topic: string | null
        }
        Insert: {
          artifact_id?: string | null
          correct?: boolean
          created_at?: string
          expected_answer?: string | null
          given_answer?: string | null
          id?: string
          question_text?: string | null
          question_type?: string
          source?: string
          student_id: string
          subject?: string | null
          thread_id?: string | null
          time_seconds?: number | null
          topic?: string | null
        }
        Update: {
          artifact_id?: string | null
          correct?: boolean
          created_at?: string
          expected_answer?: string | null
          given_answer?: string | null
          id?: string
          question_text?: string | null
          question_type?: string
          source?: string
          student_id?: string
          subject?: string | null
          thread_id?: string | null
          time_seconds?: number | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attempts_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attempts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      student_copilot_artifacts: {
        Row: {
          content: Json
          created_at: string
          id: string
          source: string
          student_id: string
          thread_id: string | null
          title: string
          type: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          source?: string
          student_id: string
          thread_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          source?: string
          student_id?: string
          thread_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_copilot_artifacts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      student_copilot_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_copilot_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      student_copilot_threads: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          last_activity_at: string
          last_message_at: string
          routine_key: string
          scope_key: string | null
          scope_meta: Json
          status: string
          student_id: string
          subject: string | null
          title: string
          tool: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          last_activity_at?: string
          last_message_at?: string
          routine_key: string
          scope_key?: string | null
          scope_meta?: Json
          status?: string
          student_id: string
          subject?: string | null
          title?: string
          tool?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          last_activity_at?: string
          last_message_at?: string
          routine_key?: string
          scope_key?: string | null
          scope_meta?: Json
          status?: string
          student_id?: string
          subject?: string | null
          title?: string
          tool?: string | null
        }
        Relationships: []
      }
      student_exams: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          max_score: number | null
          name: string
          notes: string | null
          roadmap_artifact_id: string | null
          student_id: string
          target_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          id?: string
          max_score?: number | null
          name: string
          notes?: string | null
          roadmap_artifact_id?: string | null
          student_id: string
          target_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          max_score?: number | null
          name?: string
          notes?: string | null
          roadmap_artifact_id?: string | null
          student_id?: string
          target_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_exams_roadmap_artifact_id_fkey"
            columns: ["roadmap_artifact_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          acted_on: boolean
          artifact_id: string | null
          body: string | null
          created_at: string
          dismissed: boolean
          exam_id: string | null
          id: string
          priority: number
          student_id: string
          subject: string | null
          title: string
          type: string
        }
        Insert: {
          acted_on?: boolean
          artifact_id?: string | null
          body?: string | null
          created_at?: string
          dismissed?: boolean
          exam_id?: string | null
          id?: string
          priority?: number
          student_id: string
          subject?: string | null
          title: string
          type: string
        }
        Update: {
          acted_on?: boolean
          artifact_id?: string | null
          body?: string | null
          created_at?: string
          dismissed?: boolean
          exam_id?: string | null
          id?: string
          priority?: number
          student_id?: string
          subject?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notifications_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "student_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      student_study_tasks: {
        Row: {
          artifact_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          day_index: number
          id: string
          item_index: number
          student_id: string
        }
        Insert: {
          artifact_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_index: number
          id?: string
          item_index: number
          student_id: string
        }
        Update: {
          artifact_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_index?: number
          id?: string
          item_index?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_study_tasks_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "student_copilot_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      student_topic_mastery: {
        Row: {
          accuracy: number | null
          attempts: number | null
          band: string | null
          last_attempt_at: string | null
          student_id: string | null
          subject: string | null
          topic: string | null
        }
        Relationships: []
      }
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
