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
      albums: {
        Row: {
          artist: string
          artist_wallet: string
          cover_path: string | null
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          artist: string
          artist_wallet: string
          cover_path?: string | null
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          artist?: string
          artist_wallet?: string
          cover_path?: string | null
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          granted_at: string | null
          id: string
          is_active: boolean | null
          track_id: string
          tx_hash: string
          wallet_address: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          track_id: string
          tx_hash: string
          wallet_address: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          track_id?: string
          tx_hash?: string
          wallet_address?: string
        }
        Relationships: []
      }
      play_events: {
        Row: {
          access_token: string | null
          duration_seconds: number | null
          entitlement_id: string | null
          id: string
          started_at: string | null
          track_id: string
          wallet_address: string
        }
        Insert: {
          access_token?: string | null
          duration_seconds?: number | null
          entitlement_id?: string | null
          id?: string
          started_at?: string | null
          track_id: string
          wallet_address: string
        }
        Update: {
          access_token?: string | null
          duration_seconds?: number | null
          entitlement_id?: string | null
          id?: string
          started_at?: string | null
          track_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_events_entitlement_id_fkey"
            columns: ["entitlement_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          payer_wallet: string | null
          stream_id: string
          track_id: string | null
          tx_hash: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          payer_wallet?: string | null
          stream_id: string
          track_id?: string | null
          tx_hash?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          payer_wallet?: string | null
          stream_id?: string
          track_id?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streams_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          album_id: string | null
          artist: string
          artist_wallet: string
          audio_path: string
          cover_path: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          price: number
          title: string
        }
        Insert: {
          album_id?: string | null
          artist: string
          artist_wallet: string
          audio_path: string
          cover_path?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          price?: number
          title: string
        }
        Update: {
          album_id?: string | null
          artist?: string
          artist_wallet?: string
          audio_path?: string
          cover_path?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          price?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payer_wallet: string | null
          stream_id: string | null
          track_id: string | null
          tx_hash: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payer_wallet?: string | null
          stream_id?: string | null
          track_id?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payer_wallet?: string | null
          stream_id?: string | null
          track_id?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["stream_id"]
          },
          {
            foreignKeyName: "transactions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      video_streams: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          payer_wallet: string | null
          stream_id: string
          tx_hash: string | null
          video_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          payer_wallet?: string | null
          stream_id: string
          tx_hash?: string | null
          video_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          payer_wallet?: string | null
          stream_id?: string
          tx_hash?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_streams_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payer_wallet: string | null
          stream_id: string | null
          tx_hash: string | null
          video_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payer_wallet?: string | null
          stream_id?: string | null
          tx_hash?: string | null
          video_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payer_wallet?: string | null
          stream_id?: string | null
          tx_hash?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "video_streams"
            referencedColumns: ["stream_id"]
          },
          {
            foreignKeyName: "video_transactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          artist: string
          artist_wallet: string
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_livestream: boolean
          price: number
          thumbnail_path: string | null
          title: string
          video_path: string
        }
        Insert: {
          artist: string
          artist_wallet: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_livestream?: boolean
          price?: number
          thumbnail_path?: string | null
          title: string
          video_path: string
        }
        Update: {
          artist?: string
          artist_wallet?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_livestream?: boolean
          price?: number
          thumbnail_path?: string | null
          title?: string
          video_path?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_valid_session: {
        Args: { p_access_token: string; p_track_id: string }
        Returns: boolean
      }
      get_entitlement: {
        Args: { p_track_id: string; p_wallet_address: string }
        Returns: {
          access_token: string
          entitlement_id: string
          expires_at: string
          has_entitlement: boolean
          tx_hash: string
        }[]
      }
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
