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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      agent_activity_log: {
        Row: {
          activity_type: string
          agent_id: string
          completed_at: string | null
          correlation_id: string | null
          cost_usd: number | null
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          tokens_used: number | null
          tool_name: string | null
          tool_status: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          agent_id: string
          completed_at?: string | null
          correlation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          tokens_used?: number | null
          tool_name?: string | null
          tool_status?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          agent_id?: string
          completed_at?: string | null
          correlation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          tokens_used?: number | null
          tool_name?: string | null
          tool_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          capabilities: Json | null
          config: Json | null
          created_at: string
          description: string | null
          id: string
          last_active_at: string | null
          metadata: Json | null
          name: string
          status: string
          tools_enabled: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          name: string
          status?: string
          tools_enabled?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          name?: string
          status?: string
          tools_enabled?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_runs: {
        Row: {
          board_id: string
          completed_at: string | null
          created_at: string
          created_nodes: Json | null
          error_message: string | null
          id: string
          model: string
          prompt: string
          response: string | null
          status: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          board_id: string
          completed_at?: string | null
          created_at?: string
          created_nodes?: Json | null
          error_message?: string | null
          id?: string
          model?: string
          prompt: string
          response?: string | null
          status?: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          board_id?: string
          completed_at?: string | null
          created_at?: string
          created_nodes?: Json | null
          error_message?: string | null
          id?: string
          model?: string
          prompt?: string
          response?: string | null
          status?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_runs_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      angle_bank: {
        Row: {
          created_at: string
          cta_type: string | null
          difficulty: number | null
          duration_hint: string | null
          edit_style: string | null
          example_links: string[] | null
          hook: string
          id: string
          music_item_id: string
          notes: string | null
          sound_fit: number | null
          trend_source: string | null
          updated_at: string
          variant_hooks: string[] | null
          visual_pattern: string | null
        }
        Insert: {
          created_at?: string
          cta_type?: string | null
          difficulty?: number | null
          duration_hint?: string | null
          edit_style?: string | null
          example_links?: string[] | null
          hook: string
          id?: string
          music_item_id: string
          notes?: string | null
          sound_fit?: number | null
          trend_source?: string | null
          updated_at?: string
          variant_hooks?: string[] | null
          visual_pattern?: string | null
        }
        Update: {
          created_at?: string
          cta_type?: string | null
          difficulty?: number | null
          duration_hint?: string | null
          edit_style?: string | null
          example_links?: string[] | null
          hook?: string
          id?: string
          music_item_id?: string
          notes?: string | null
          sound_fit?: number | null
          trend_source?: string | null
          updated_at?: string
          variant_hooks?: string[] | null
          visual_pattern?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "angle_bank_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          body_html: string | null
          body_text: string | null
          canonical_url: string | null
          entities: Json | null
          excerpt: string | null
          fetched_at: string | null
          id: string
          image_url: string | null
          published_at: string | null
          score: number | null
          simhash: number | null
          source_id: string | null
          tags: string[] | null
          thumb_url: string | null
          title: string
          topics: string[] | null
          url: string
        }
        Insert: {
          author?: string | null
          body_html?: string | null
          body_text?: string | null
          canonical_url?: string | null
          entities?: Json | null
          excerpt?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          score?: number | null
          simhash?: number | null
          source_id?: string | null
          tags?: string[] | null
          thumb_url?: string | null
          title: string
          topics?: string[] | null
          url: string
        }
        Update: {
          author?: string | null
          body_html?: string | null
          body_text?: string | null
          canonical_url?: string | null
          entities?: Json | null
          excerpt?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          score?: number | null
          simhash?: number | null
          source_id?: string | null
          tags?: string[] | null
          thumb_url?: string | null
          title?: string
          topics?: string[] | null
          url?: string
        }
        Relationships: []
      }
      audio_tracks: {
        Row: {
          created_at: string
          duration_ms: number | null
          end_time_ms: number | null
          id: string
          is_muted: boolean | null
          metadata: Json | null
          name: string
          project_id: string
          start_time_ms: number | null
          storage_bucket: string
          storage_path: string
          updated_at: string
          user_id: string
          volume: number | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          end_time_ms?: number | null
          id?: string
          is_muted?: boolean | null
          metadata?: Json | null
          name: string
          project_id: string
          start_time_ms?: number | null
          storage_bucket: string
          storage_path: string
          updated_at?: string
          user_id: string
          volume?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          end_time_ms?: number | null
          id?: string
          is_muted?: boolean | null
          metadata?: Json | null
          name?: string
          project_id?: string
          start_time_ms?: number | null
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_analytics: {
        Row: {
          action_id: string | null
          context: Json | null
          created_at: string | null
          execution_log_id: string | null
          id: string
          metric_type: string
          metric_value: number | null
          user_id: string
        }
        Insert: {
          action_id?: string | null
          context?: Json | null
          created_at?: string | null
          execution_log_id?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          user_id: string
        }
        Update: {
          action_id?: string | null
          context?: Json | null
          created_at?: string | null
          execution_log_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_analytics_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_analytics_execution_log_id_fkey"
            columns: ["execution_log_id"]
            isOneToOne: false
            referencedRelation: "execution_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      board_collaborators: {
        Row: {
          board_id: string
          created_at: string
          email: string | null
          id: string
          invited_by: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          board_id: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          board_id?: string
          created_at?: string
          email?: string | null
          id?: string
          invited_by?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_collaborators_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_comments: {
        Row: {
          board_id: string
          content: string
          created_at: string
          id: string
          node_id: string | null
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          board_id: string
          content: string
          created_at?: string
          id?: string
          node_id?: string | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          board_id?: string
          content?: string
          created_at?: string
          id?: string
          node_id?: string | null
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_comments_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_shares: {
        Row: {
          board_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          share_id: string
          title: string
        }
        Insert: {
          board_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          share_id: string
          title: string
        }
        Update: {
          board_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          share_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_shares_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          canvas_data: Json
          content: Json | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          slug: string | null
          source_project_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data?: Json
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          slug?: string | null
          source_project_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          slug?: string | null
          source_project_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_communications: {
        Row: {
          body: string | null
          booking_id: string
          communication_type: string | null
          direction: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          booking_id: string
          communication_type?: string | null
          direction?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          booking_id?: string
          communication_type?: string | null
          direction?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_communications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "venue_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          auto_apply_to_designs: boolean | null
          color_palette: Json | null
          created_at: string | null
          guidelines_pdf_url: string | null
          id: string
          is_default: boolean | null
          logo_clear_space: number | null
          logo_icon_url: string | null
          logo_min_size: number | null
          logo_primary_url: string | null
          logo_secondary_url: string | null
          name: string
          typography: Json | null
          updated_at: string | null
          usage_rules: string[] | null
          user_id: string
        }
        Insert: {
          auto_apply_to_designs?: boolean | null
          color_palette?: Json | null
          created_at?: string | null
          guidelines_pdf_url?: string | null
          id?: string
          is_default?: boolean | null
          logo_clear_space?: number | null
          logo_icon_url?: string | null
          logo_min_size?: number | null
          logo_primary_url?: string | null
          logo_secondary_url?: string | null
          name: string
          typography?: Json | null
          updated_at?: string | null
          usage_rules?: string[] | null
          user_id: string
        }
        Update: {
          auto_apply_to_designs?: boolean | null
          color_palette?: Json | null
          created_at?: string | null
          guidelines_pdf_url?: string | null
          id?: string
          is_default?: boolean | null
          logo_clear_space?: number | null
          logo_icon_url?: string | null
          logo_min_size?: number | null
          logo_primary_url?: string | null
          logo_secondary_url?: string | null
          name?: string
          typography?: Json | null
          updated_at?: string | null
          usage_rules?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      canvas_assets: {
        Row: {
          asset_type: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          metadata: Json | null
          mime_type: string
          project_id: string
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          metadata?: Json | null
          mime_type: string
          project_id: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "canvas_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_objects: {
        Row: {
          created_at: string
          data: Json
          id: string
          layer_index: number
          locked: boolean
          object_type: string
          project_id: string
          transform: Json
          updated_at: string
          visibility: boolean
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          layer_index: number
          locked?: boolean
          object_type: string
          project_id: string
          transform?: Json
          updated_at?: string
          visibility?: boolean
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          layer_index?: number
          locked?: boolean
          object_type?: string
          project_id?: string
          transform?: Json
          updated_at?: string
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "canvas_objects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "canvas_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          viewport: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          viewport?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          viewport?: Json
        }
        Relationships: []
      }
      canvas_state: {
        Row: {
          canvas_settings: Json | null
          id: string
          project_id: string
          updated_at: string
          user_id: string
          viewport_data: Json | null
        }
        Insert: {
          canvas_settings?: Json | null
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
          viewport_data?: Json | null
        }
        Update: {
          canvas_settings?: Json | null
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
          viewport_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_state_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_timeline_edges: {
        Row: {
          created_at: string
          edge_data: Json | null
          id: string
          project_id: string
          source_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          edge_data?: Json | null
          id?: string
          project_id: string
          source_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          edge_data?: Json | null
          id?: string
          project_id?: string
          source_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_timeline_edges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "canvas_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canvas_timeline_edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "canvas_timeline_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canvas_timeline_edges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "canvas_timeline_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_timeline_nodes: {
        Row: {
          created_at: string
          data: Json
          id: string
          node_type: string
          position: Json
          project_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          node_type: string
          position?: Json
          project_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          node_type?: string
          position?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_timeline_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "canvas_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_generation_error: string | null
          image_status: string | null
          image_url: string | null
          name: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_generation_error?: string | null
          image_status?: string | null
          image_url?: string | null
          name: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_generation_error?: string | null
          image_status?: string | null
          image_url?: string | null
          name?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          id: string
          is_paused: boolean | null
          name: string
          order_index: number
          query: Json
          user_id: string
        }
        Insert: {
          id?: string
          is_paused?: boolean | null
          name: string
          order_index?: number
          query: Json
          user_id: string
        }
        Update: {
          id?: string
          is_paused?: boolean | null
          name?: string
          order_index?: number
          query?: Json
          user_id?: string
        }
        Relationships: []
      }
      contact_venues: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          notes: string | null
          relationship_type: string | null
          venue_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          relationship_type?: string | null
          venue_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          relationship_type?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_venues_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "tour_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      content_assets: {
        Row: {
          asset_type: string
          content_queue_id: string
          created_at: string
          file_path: string | null
          file_url: string
          generation_params: Json | null
          id: string
          metadata: Json | null
          variant: string | null
        }
        Insert: {
          asset_type: string
          content_queue_id: string
          created_at?: string
          file_path?: string | null
          file_url: string
          generation_params?: Json | null
          id?: string
          metadata?: Json | null
          variant?: string | null
        }
        Update: {
          asset_type?: string
          content_queue_id?: string
          created_at?: string
          file_path?: string | null
          file_url?: string
          generation_params?: Json | null
          id?: string
          metadata?: Json | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_content_queue_id_fkey"
            columns: ["content_queue_id"]
            isOneToOne: false
            referencedRelation: "content_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      content_folders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      content_insights: {
        Row: {
          angle_performance: Json | null
          color_performance: Json | null
          created_at: string
          cta_performance: Json | null
          hook_performance: Json | null
          id: string
          music_item_id: string | null
          period_end: string
          period_start: string
          recommendations: string[] | null
          summary: string | null
        }
        Insert: {
          angle_performance?: Json | null
          color_performance?: Json | null
          created_at?: string
          cta_performance?: Json | null
          hook_performance?: Json | null
          id?: string
          music_item_id?: string | null
          period_end: string
          period_start: string
          recommendations?: string[] | null
          summary?: string | null
        }
        Update: {
          angle_performance?: Json | null
          color_performance?: Json | null
          created_at?: string
          cta_performance?: Json | null
          hook_performance?: Json | null
          id?: string
          music_item_id?: string | null
          period_end?: string
          period_start?: string
          recommendations?: string[] | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_insights_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string | null
          folder_id: string | null
          id: string
          metadata: Json | null
          qr_code_data: string | null
          storage_path: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          qr_code_data?: string | null
          storage_path?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          qr_code_data?: string | null
          storage_path?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      content_queue: {
        Row: {
          angle_id: string
          beats: Json | null
          caption: string | null
          created_at: string
          cta: string | null
          day: string
          hashtags: string[] | null
          id: string
          music_item_id: string
          palette: Json | null
          performance_data: Json | null
          script: string
          status: string
          thumb_prompt: string | null
          updated_at: string
        }
        Insert: {
          angle_id: string
          beats?: Json | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          day: string
          hashtags?: string[] | null
          id?: string
          music_item_id: string
          palette?: Json | null
          performance_data?: Json | null
          script: string
          status?: string
          thumb_prompt?: string | null
          updated_at?: string
        }
        Update: {
          angle_id?: string
          beats?: Json | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          day?: string
          hashtags?: string[] | null
          id?: string
          music_item_id?: string
          palette?: Json | null
          performance_data?: Json | null
          script?: string
          status?: string
          thumb_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_queue_angle_id_fkey"
            columns: ["angle_id"]
            isOneToOne: false
            referencedRelation: "angle_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_queue_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_jobs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          source_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          source_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      crawl_logs: {
        Row: {
          created_at: string | null
          id: number
          job_id: string | null
          level: string | null
          meta: Json | null
          msg: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          level?: string | null
          meta?: Json | null
          msg?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          job_id?: string | null
          level?: string | null
          meta?: Json | null
          msg?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          resource_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number
          asset_symbol: string
          created_at: string
          id: string
          network: string
          payment_method: string
          status: string
          transaction_data: Json | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asset_symbol: string
          created_at?: string
          id?: string
          network: string
          payment_method: string
          status?: string
          transaction_data?: Json | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_symbol?: string
          created_at?: string
          id?: string
          network?: string
          payment_method?: string
          status?: string
          transaction_data?: Json | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_analytics: {
        Row: {
          created_at: string | null
          design_id: string
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string | null
          design_id: string
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string | null
          design_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_analytics_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      design_templates: {
        Row: {
          canvas_data: Json
          category: string
          created_at: string | null
          creator_id: string | null
          description: string | null
          downloads: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          preview_images: string[] | null
          price: number
          rating: number | null
          review_count: number | null
          style: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          canvas_data: Json
          category: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          preview_images?: string[] | null
          price?: number
          rating?: number | null
          review_count?: number | null
          style: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          canvas_data?: Json
          category?: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          preview_images?: string[] | null
          price?: number
          rating?: number | null
          review_count?: number | null
          style?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      design_versions: {
        Row: {
          canvas_data: Json | null
          changes_description: string | null
          created_at: string
          created_by: string | null
          design_id: string
          design_image_url: string | null
          id: string
          version_number: number
        }
        Insert: {
          canvas_data?: Json | null
          changes_description?: string | null
          created_at?: string
          created_by?: string | null
          design_id: string
          design_image_url?: string | null
          id?: string
          version_number: number
        }
        Update: {
          canvas_data?: Json | null
          changes_description?: string | null
          created_at?: string
          created_by?: string | null
          design_id?: string
          design_image_url?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "design_versions_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          ai_json_prompt: Json | null
          ai_prompt: string | null
          canvas_data: Json | null
          created_at: string | null
          description: string | null
          design_image_url: string | null
          design_type: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_json_prompt?: Json | null
          ai_prompt?: string | null
          canvas_data?: Json | null
          created_at?: string | null
          description?: string | null
          design_image_url?: string | null
          design_type?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_json_prompt?: Json | null
          ai_prompt?: string | null
          canvas_data?: Json | null
          created_at?: string | null
          description?: string | null
          design_image_url?: string | null
          design_type?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      edges: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          source_node_id: string
          target_node_id: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source_node_id: string
          target_node_id: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source_node_id?: string
          target_node_id?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edges_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      event_assets: {
        Row: {
          ai_model_used: string | null
          asset_type: string
          booking_id: string
          created_at: string | null
          file_url: string | null
          generation_prompt: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          asset_type: string
          booking_id: string
          created_at?: string | null
          file_url?: string | null
          generation_prompt?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          asset_type?: string
          booking_id?: string
          created_at?: string | null
          file_url?: string | null
          generation_prompt?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_assets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "venue_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_logs: {
        Row: {
          action_id: string
          checkpoints_cancelled: number | null
          checkpoints_modified: number | null
          checkpoints_shown: number | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          error_message: string | null
          execution_data: Json | null
          id: string
          screenshot_url: string | null
          start_time: string | null
          status: string
          user_id: string
        }
        Insert: {
          action_id: string
          checkpoints_cancelled?: number | null
          checkpoints_modified?: number | null
          checkpoints_shown?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          screenshot_url?: string | null
          start_time?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action_id?: string
          checkpoints_cancelled?: number | null
          checkpoints_modified?: number | null
          checkpoints_shown?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          screenshot_url?: string | null
          start_time?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_node_status: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          node_id: string
          outputs: Json | null
          progress: number | null
          run_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          node_id: string
          outputs?: Json | null
          progress?: number | null
          run_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          node_id?: string
          outputs?: Json | null
          progress?: number | null
          run_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_node_status_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "execution_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_runs: {
        Row: {
          completed_nodes: number
          created_at: string | null
          error_message: string | null
          execution_order: Json | null
          finished_at: string | null
          id: string
          project_id: string
          started_at: string | null
          status: string
          total_nodes: number
          updated_at: string | null
        }
        Insert: {
          completed_nodes?: number
          created_at?: string | null
          error_message?: string | null
          execution_order?: Json | null
          finished_at?: string | null
          id?: string
          project_id: string
          started_at?: string | null
          status: string
          total_nodes?: number
          updated_at?: string | null
        }
        Update: {
          completed_nodes?: number
          created_at?: string | null
          error_message?: string | null
          execution_order?: Json | null
          finished_at?: string | null
          id?: string
          project_id?: string
          started_at?: string | null
          status?: string
          total_nodes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      falai_job_updates: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          output: Json | null
          progress: number | null
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          output?: Json | null
          progress?: number | null
          request_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          output?: Json | null
          progress?: number | null
          request_id?: string
          status?: string
        }
        Relationships: []
      }
      falai_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error: string | null
          id: string
          inputs: Json
          model_id: string
          output: Json | null
          project_id: string | null
          request_id: string | null
          source: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          inputs: Json
          model_id: string
          output?: Json | null
          project_id?: string | null
          request_id?: string | null
          source?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          inputs?: Json
          model_id?: string
          output?: Json | null
          project_id?: string | null
          request_id?: string | null
          source?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "falai_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      function_rate_limits: {
        Row: {
          call_count: number | null
          created_at: string | null
          function_name: string
          id: string
          ip_address: string | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          call_count?: number | null
          created_at?: string | null
          function_name: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          call_count?: number | null
          created_at?: string | null
          function_name?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      fund_transactions: {
        Row: {
          amount: number
          asset_symbol: string
          created_at: string
          id: string
          payment_method: string
          status: string
          transaction_id: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asset_symbol: string
          created_at?: string
          id?: string
          payment_method: string
          status?: string
          transaction_id: string
          transaction_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asset_symbol?: string
          created_at?: string
          id?: string
          payment_method?: string
          status?: string
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          priority: number | null
          progress: number | null
          result_url: string | null
          started_at: string | null
          status: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          priority?: number | null
          progress?: number | null
          result_url?: string | null
          started_at?: string | null
          status?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          priority?: number | null
          progress?: number | null
          result_url?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      generations: {
        Row: {
          canvas_id: string | null
          cost_credits: number | null
          created_at: string | null
          error: string | null
          generation_time_ms: number | null
          id: string
          input_image_url: string | null
          lora_url: string | null
          model: string
          negative_prompt: string | null
          object_id: string | null
          output_image_url: string | null
          prompt: string
          settings: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canvas_id?: string | null
          cost_credits?: number | null
          created_at?: string | null
          error?: string | null
          generation_time_ms?: number | null
          id?: string
          input_image_url?: string | null
          lora_url?: string | null
          model: string
          negative_prompt?: string | null
          object_id?: string | null
          output_image_url?: string | null
          prompt: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canvas_id?: string | null
          cost_credits?: number | null
          created_at?: string | null
          error?: string | null
          generation_time_ms?: number | null
          id?: string
          input_image_url?: string | null
          lora_url?: string | null
          model?: string
          negative_prompt?: string | null
          object_id?: string | null
          output_image_url?: string | null
          prompt?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gigs: {
        Row: {
          capacity: number | null
          contract_url: string | null
          created_at: string | null
          date: string
          door_split_percentage: number | null
          guarantee_amount: number | null
          id: string
          notes: string | null
          status: string | null
          ticket_price: number | null
          title: string
          updated_at: string | null
          user_id: string
          venue_id: string | null
        }
        Insert: {
          capacity?: number | null
          contract_url?: string | null
          created_at?: string | null
          date: string
          door_split_percentage?: number | null
          guarantee_amount?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          venue_id?: string | null
        }
        Update: {
          capacity?: number | null
          contract_url?: string | null
          created_at?: string | null
          date?: string
          door_split_percentage?: number | null
          guarantee_amount?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gigs_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          article_id: string
          created_at: string | null
          kind: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          kind: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          balance_due: number | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          gig_id: string
          id: string
          invoice_number: string | null
          line_items: Json | null
          notes: string | null
          paid_at: string | null
          paid_date: string | null
          payment_method: string | null
          status: string | null
          tax_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_due?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          gig_id: string
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_due?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          gig_id?: string
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          locked_by: string | null
          locked_until: string | null
          payload: Json
          priority: number
          project_id: string | null
          scheduled_for: string
          status: string
          task_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          locked_by?: string | null
          locked_until?: string | null
          payload?: Json
          priority?: number
          project_id?: string | null
          scheduled_for?: string
          status?: string
          task_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          locked_by?: string | null
          locked_until?: string | null
          payload?: Json
          priority?: number
          project_id?: string | null
          scheduled_for?: string
          status?: string
          task_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_queue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          exec_mode: string
          id: string
          input_video_url: string
          manifest_data: Json
          mode: string
          output_urls: string[] | null
          progress: number | null
          settings: Json
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          exec_mode?: string
          id?: string
          input_video_url: string
          manifest_data: Json
          mode: string
          output_urls?: string[] | null
          progress?: number | null
          settings?: Json
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          exec_mode?: string
          id?: string
          input_video_url?: string
          manifest_data?: Json
          mode?: string
          output_urls?: string[] | null
          progress?: number | null
          settings?: Json
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      keyframes: {
        Row: {
          created_at: string | null
          id: string
          properties: Json
          timestamp: number
          track_item_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          properties?: Json
          timestamp: number
          track_item_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          properties?: Json
          timestamp?: number
          track_item_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyframes_track_item_id_fkey"
            columns: ["track_item_id"]
            isOneToOne: false
            referencedRelation: "track_items"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_a1c444fa: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      manus_tasks: {
        Row: {
          completed_at: string | null
          connectors: Json | null
          created_at: string
          error_message: string | null
          id: string
          manus_task_id: string
          metadata: Json | null
          mode: string
          prompt: string
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connectors?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          manus_task_id: string
          metadata?: Json | null
          mode?: string
          prompt: string
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connectors?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          manus_task_id?: string
          metadata?: Json | null
          mode?: string
          prompt?: string
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          asset_type: string
          cdn_url: string | null
          created_at: string
          file_name: string
          id: string
          mime_type: string
          project_id: string | null
          purpose: string
          size_bytes: number | null
          storage_path: string | null
          storage_provider: string | null
          user_id: string
        }
        Insert: {
          asset_type: string
          cdn_url?: string | null
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          project_id?: string | null
          purpose: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          cdn_url?: string | null
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          project_id?: string | null
          purpose?: string
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          created_at: string | null
          duration: number | null
          duration_seconds: number | null
          end_time: number | null
          file_size: number | null
          id: string
          media_type: string
          metadata: Json | null
          mime_type: string | null
          name: string
          project_id: string
          source_type: string | null
          start_time: number | null
          status: string | null
          storage_bucket: string | null
          storage_path: string | null
          thumbnail_url: string | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          duration_seconds?: number | null
          end_time?: number | null
          file_size?: number | null
          id?: string
          media_type: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          project_id: string
          source_type?: string | null
          start_time?: number | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          duration_seconds?: number | null
          end_time?: number | null
          file_size?: number | null
          id?: string
          media_type?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          project_id?: string
          source_type?: string | null
          start_time?: number | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      merchandise_orders: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          delivered_at: string | null
          design_id: string | null
          estimated_delivery: string | null
          external_order_id: string | null
          fulfillment_provider: string | null
          id: string
          mockup_urls: string[] | null
          notes: string | null
          order_type: string
          product_details: Json
          product_template_id: string | null
          quantity: number
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string
          tax_amount: number | null
          total_cost: number
          tracking_number: string | null
          tracking_url: string | null
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          design_id?: string | null
          estimated_delivery?: string | null
          external_order_id?: string | null
          fulfillment_provider?: string | null
          id?: string
          mockup_urls?: string[] | null
          notes?: string | null
          order_type: string
          product_details: Json
          product_template_id?: string | null
          quantity?: number
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string
          tax_amount?: number | null
          total_cost: number
          tracking_number?: string | null
          tracking_url?: string | null
          unit_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          design_id?: string | null
          estimated_delivery?: string | null
          external_order_id?: string | null
          fulfillment_provider?: string | null
          id?: string
          mockup_urls?: string[] | null
          notes?: string | null
          order_type?: string
          product_details?: Json
          product_template_id?: string | null
          quantity?: number
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string
          tax_amount?: number | null
          total_cost?: number
          tracking_number?: string | null
          tracking_url?: string | null
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_orders_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchandise_orders_product_template_id_fkey"
            columns: ["product_template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      mockups: {
        Row: {
          created_at: string | null
          design_id: string
          id: string
          image_url: string
          product_template_id: string
          render_settings: Json | null
          scene_type: string | null
        }
        Insert: {
          created_at?: string | null
          design_id: string
          id?: string
          image_url: string
          product_template_id: string
          render_settings?: Json | null
          scene_type?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string
          id?: string
          image_url?: string
          product_template_id?: string
          render_settings?: Json | null
          scene_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mockups_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mockups_product_template_id_fkey"
            columns: ["product_template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      music_items: {
        Row: {
          album: string | null
          artists: string[] | null
          bpm: number | null
          channel: string | null
          color_palette: Json | null
          cover_art_url: string | null
          created_at: string
          danceability: number | null
          duration: number | null
          energy: number | null
          genre_tags: string[] | null
          id: string
          instrumentation: string[] | null
          isrc: string | null
          key: string | null
          metadata: Json | null
          mode: string | null
          mood_tags: string[] | null
          platform: string
          publish_date: string | null
          release_date: string | null
          source_url: string
          spotify_id: string | null
          tags: string[] | null
          tempo_estimate: number | null
          thumb_url: string | null
          title: string
          updated_at: string
          user_id: string
          valence: number | null
          youtube_id: string | null
        }
        Insert: {
          album?: string | null
          artists?: string[] | null
          bpm?: number | null
          channel?: string | null
          color_palette?: Json | null
          cover_art_url?: string | null
          created_at?: string
          danceability?: number | null
          duration?: number | null
          energy?: number | null
          genre_tags?: string[] | null
          id?: string
          instrumentation?: string[] | null
          isrc?: string | null
          key?: string | null
          metadata?: Json | null
          mode?: string | null
          mood_tags?: string[] | null
          platform: string
          publish_date?: string | null
          release_date?: string | null
          source_url: string
          spotify_id?: string | null
          tags?: string[] | null
          tempo_estimate?: number | null
          thumb_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          valence?: number | null
          youtube_id?: string | null
        }
        Update: {
          album?: string | null
          artists?: string[] | null
          bpm?: number | null
          channel?: string | null
          color_palette?: Json | null
          cover_art_url?: string | null
          created_at?: string
          danceability?: number | null
          duration?: number | null
          energy?: number | null
          genre_tags?: string[] | null
          id?: string
          instrumentation?: string[] | null
          isrc?: string | null
          key?: string | null
          metadata?: Json | null
          mode?: string | null
          mood_tags?: string[] | null
          platform?: string
          publish_date?: string | null
          release_date?: string | null
          source_url?: string
          spotify_id?: string | null
          tags?: string[] | null
          tempo_estimate?: number | null
          thumb_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          valence?: number | null
          youtube_id?: string | null
        }
        Relationships: []
      }
      nodes: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          position_x: number
          position_y: number
          type: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          position_x: number
          position_y: number
          type: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          position_x?: number
          position_y?: number
          type?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          customizations: Json | null
          design_id: string | null
          id: string
          order_id: string
          product_template_id: string | null
          quantity: number
          size: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customizations?: Json | null
          design_id?: string | null
          id?: string
          order_id: string
          product_template_id?: string | null
          quantity?: number
          size?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customizations?: Json | null
          design_id?: string | null
          id?: string
          order_id?: string
          product_template_id?: string | null
          quantity?: number
          size?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "merchandise_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_template_id_fkey"
            columns: ["product_template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "merchandise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_format: string | null
          audio_signed_url: string | null
          audio_url: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          id: string
          outline: Json | null
          script: string | null
          segments: Json | null
          show_notes: string | null
          style: string | null
          title: string
          updated_at: string | null
          user_id: string
          voice_id: string | null
        }
        Insert: {
          audio_format?: string | null
          audio_signed_url?: string | null
          audio_url: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          outline?: Json | null
          script?: string | null
          segments?: Json | null
          show_notes?: string | null
          style?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
        }
        Update: {
          audio_format?: string | null
          audio_signed_url?: string | null
          audio_url?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          outline?: Json | null
          script?: string | null
          segments?: Json | null
          show_notes?: string | null
          style?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      press_quotes: {
        Row: {
          created_at: string | null
          date: string
          id: number
          quote: string
          source: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: number
          quote: string
          source: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: number
          quote?: string
          source?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      print_partner_connections: {
        Row: {
          api_key_hash: string
          created_at: string
          id: string
          is_enabled: boolean
          provider: string
          provider_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider: string
          provider_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider?: string
          provider_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_templates: {
        Row: {
          available: boolean | null
          base_cost: number
          category: string
          created_at: string | null
          id: string
          image_url: string | null
          mockup_settings: Json | null
          name: string
          print_areas: Json | null
          specifications: Json | null
          subcategory: string
        }
        Insert: {
          available?: boolean | null
          base_cost: number
          category: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          mockup_settings?: Json | null
          name: string
          print_areas?: Json | null
          specifications?: Json | null
          subcategory: string
        }
        Update: {
          available?: boolean | null
          base_cost?: number
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          mockup_settings?: Json | null
          name?: string
          print_areas?: Json | null
          specifications?: Json | null
          subcategory?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_preferences: Json | null
          avatar_url: string | null
          connected_accounts: Json | null
          created_at: string
          id: string
          last_wallet_connection: string | null
          onboarding_completed: boolean
          personality_type: string | null
          updated_at: string
          uploaded_files: Json | null
          username: string | null
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          connected_accounts?: Json | null
          created_at?: string
          id: string
          last_wallet_connection?: string | null
          onboarding_completed?: boolean
          personality_type?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          username?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          connected_accounts?: Json | null
          created_at?: string
          id?: string
          last_wallet_connection?: string | null
          onboarding_completed?: boolean
          personality_type?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          username?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          add_voiceover: boolean | null
          aspect_ratio: string | null
          call_to_action: string | null
          cinematic_inspiration: string | null
          concept_option: string | null
          concept_text: string | null
          created_at: string | null
          custom_format_description: string | null
          description: string | null
          format: string | null
          genre: string | null
          id: string
          main_message: string | null
          product_name: string | null
          selected_storyline_id: string | null
          special_requests: string | null
          style_reference_asset_id: string | null
          target_audience: string | null
          title: string
          tone: string | null
          updated_at: string | null
          user_id: string
          video_style: string | null
        }
        Insert: {
          add_voiceover?: boolean | null
          aspect_ratio?: string | null
          call_to_action?: string | null
          cinematic_inspiration?: string | null
          concept_option?: string | null
          concept_text?: string | null
          created_at?: string | null
          custom_format_description?: string | null
          description?: string | null
          format?: string | null
          genre?: string | null
          id?: string
          main_message?: string | null
          product_name?: string | null
          selected_storyline_id?: string | null
          special_requests?: string | null
          style_reference_asset_id?: string | null
          target_audience?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id: string
          video_style?: string | null
        }
        Update: {
          add_voiceover?: boolean | null
          aspect_ratio?: string | null
          call_to_action?: string | null
          cinematic_inspiration?: string | null
          concept_option?: string | null
          concept_text?: string | null
          created_at?: string | null
          custom_format_description?: string | null
          description?: string | null
          format?: string | null
          genre?: string | null
          id?: string
          main_message?: string | null
          product_name?: string | null
          selected_storyline_id?: string | null
          special_requests?: string | null
          style_reference_asset_id?: string | null
          target_audience?: string | null
          title?: string
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          video_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_selected_storyline_id_fkey"
            columns: ["selected_storyline_id"]
            isOneToOne: false
            referencedRelation: "storylines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_style_reference_asset_id_fkey"
            columns: ["style_reference_asset_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tracking: {
        Row: {
          conversion_date: string | null
          created_at: string
          id: string
          referee_email: string
          referral_code: string
          referrer_email: string
        }
        Insert: {
          conversion_date?: string | null
          created_at?: string
          id?: string
          referee_email: string
          referral_code: string
          referrer_email: string
        }
        Update: {
          conversion_date?: string | null
          created_at?: string
          id?: string
          referee_email?: string
          referral_code?: string
          referrer_email?: string
        }
        Relationships: []
      }
      render_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion: string | null
          id: string
          priority: number | null
          progress: number | null
          result_url: string | null
          started_at: string | null
          status: string
          timeline_id: string | null
          user_id: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          priority?: number | null
          progress?: number | null
          result_url?: string | null
          started_at?: string | null
          status?: string
          timeline_id?: string | null
          user_id: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          priority?: number | null
          progress?: number | null
          result_url?: string | null
          started_at?: string | null
          status?: string
          timeline_id?: string | null
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "render_queue_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          model: string | null
          role: string
          session_id: string
          sources: string[] | null
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          model?: string | null
          role: string
          session_id: string
          sources?: string[] | null
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          model?: string | null
          role?: string
          session_id?: string
          sources?: string[] | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "research_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "research_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          session_identifier: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_identifier: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_identifier?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lighting: string | null
          location: string | null
          project_id: string
          scene_number: number
          storyline_id: string | null
          title: string | null
          updated_at: string
          voiceover: string | null
          weather: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lighting?: string | null
          location?: string | null
          project_id: string
          scene_number: number
          storyline_id?: string | null
          title?: string | null
          updated_at?: string
          voiceover?: string | null
          weather?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lighting?: string | null
          location?: string | null
          project_id?: string
          scene_number?: number
          storyline_id?: string | null
          title?: string | null
          updated_at?: string
          voiceover?: string | null
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenes_storyline_id_fkey"
            columns: ["storyline_id"]
            isOneToOne: false
            referencedRelation: "storylines"
            referencedColumns: ["id"]
          },
        ]
      }
      screen_recordings: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string | null
          id: string
          raw_data: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          raw_data?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          raw_data?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      share_analytics: {
        Row: {
          created_at: string
          id: string
          platform: string
          referral_code: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          referral_code: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          referral_code?: string
          user_email?: string
        }
        Relationships: []
      }
      shared_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          share_id: string
          thumbnail_url: string | null
          title: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          share_id: string
          thumbnail_url?: string | null
          title: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          share_id?: string
          thumbnail_url?: string | null
          title?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          share_id: string
          title: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          share_id: string
          title: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          share_id?: string
          title?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_workflows_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          audio_status: string | null
          audio_url: string | null
          created_at: string | null
          dialogue: string | null
          failure_reason: string | null
          id: string
          image_status: string | null
          image_url: string | null
          luma_generation_id: string | null
          project_id: string
          prompt_idea: string | null
          scene_id: string
          shot_number: number
          shot_type: string | null
          sound_effects: string | null
          updated_at: string | null
          video_status: string | null
          video_url: string | null
          visual_prompt: string | null
        }
        Insert: {
          audio_status?: string | null
          audio_url?: string | null
          created_at?: string | null
          dialogue?: string | null
          failure_reason?: string | null
          id?: string
          image_status?: string | null
          image_url?: string | null
          luma_generation_id?: string | null
          project_id: string
          prompt_idea?: string | null
          scene_id: string
          shot_number: number
          shot_type?: string | null
          sound_effects?: string | null
          updated_at?: string | null
          video_status?: string | null
          video_url?: string | null
          visual_prompt?: string | null
        }
        Update: {
          audio_status?: string | null
          audio_url?: string | null
          created_at?: string | null
          dialogue?: string | null
          failure_reason?: string | null
          id?: string
          image_status?: string | null
          image_url?: string | null
          luma_generation_id?: string | null
          project_id?: string
          prompt_idea?: string | null
          scene_id?: string
          shot_number?: number
          shot_type?: string | null
          sound_effects?: string | null
          updated_at?: string | null
          video_status?: string | null
          video_url?: string | null
          visual_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          name: string
          parse_strategy: string
          rss_urls: string[] | null
          selectors: Json | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          name: string
          parse_strategy: string
          rss_urls?: string[] | null
          selectors?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parse_strategy?: string
          rss_urls?: string[] | null
          selectors?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          created_at: string | null
          date: string
          id: number
          metric_name: string
          updated_at: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: number
          metric_name: string
          updated_at?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: number
          metric_name?: string
          updated_at?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      storylines: {
        Row: {
          created_at: string
          description: string
          failure_reason: string | null
          full_story: string
          generated_by: string | null
          id: string
          is_selected: boolean | null
          project_id: string
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          failure_reason?: string | null
          full_story: string
          generated_by?: string | null
          id?: string
          is_selected?: boolean | null
          project_id: string
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          failure_reason?: string | null
          full_story?: string
          generated_by?: string | null
          id?: string
          is_selected?: boolean | null
          project_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "storylines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_blocks: {
        Row: {
          block_type: string
          created_at: string
          generated_output_url: string | null
          generation_metadata: Json | null
          id: string
          position_x: number
          position_y: number
          project_id: string
          prompt: string | null
          selected_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_type: string
          created_at?: string
          generated_output_url?: string | null
          generation_metadata?: Json | null
          id?: string
          position_x: number
          position_y: number
          project_id: string
          prompt?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_type?: string
          created_at?: string
          generated_output_url?: string | null
          generation_metadata?: Json | null
          id?: string
          position_x?: number
          position_y?: number
          project_id?: string
          prompt?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_connections: {
        Row: {
          animated: boolean | null
          created_at: string | null
          id: string
          project_id: string
          source_block_id: string
          source_handle: string | null
          target_block_id: string
          target_handle: string | null
        }
        Insert: {
          animated?: boolean | null
          created_at?: string | null
          id?: string
          project_id: string
          source_block_id: string
          source_handle?: string | null
          target_block_id: string
          target_handle?: string | null
        }
        Update: {
          animated?: boolean | null
          created_at?: string | null
          id?: string
          project_id?: string
          source_block_id?: string
          source_handle?: string | null
          target_block_id?: string
          target_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_connections_source_block_id_fkey"
            columns: ["source_block_id"]
            isOneToOne: false
            referencedRelation: "studio_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_connections_target_block_id_fkey"
            columns: ["target_block_id"]
            isOneToOne: false
            referencedRelation: "studio_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_packs: {
        Row: {
          created_at: string | null
          design_id: string
          id: string
          materials: Json | null
          measurements: Json | null
          pdf_url: string | null
          print_specs: Json | null
          product_template_id: string
          specifications: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          design_id: string
          id?: string
          materials?: Json | null
          measurements?: Json | null
          pdf_url?: string | null
          print_specs?: Json | null
          product_template_id: string
          specifications?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string
          id?: string
          materials?: Json | null
          measurements?: Json | null
          pdf_url?: string | null
          print_specs?: Json | null
          product_template_id?: string
          specifications?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_packs_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_packs_product_template_id_fkey"
            columns: ["product_template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          price_paid: number
          template_id: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          price_paid: number
          template_id: string
          user_id: string
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          price_paid?: number
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_downloads_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "design_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "design_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_sales: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          price: number
          quantity_sold: number
          quantity_total: number
          sale_end_date: string | null
          sale_start_date: string | null
          ticket_type: string
          ticket_url: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          price: number
          quantity_sold?: number
          quantity_total?: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          ticket_type: string
          ticket_url?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          price?: number
          quantity_sold?: number
          quantity_total?: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          ticket_type?: string
          ticket_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_sales_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "venue_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      timelines: {
        Row: {
          composition_data: Json
          created_at: string
          duration_ms: number | null
          frame_rate: number | null
          id: string
          project_id: string | null
          resolution: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          composition_data?: Json
          created_at?: string
          duration_ms?: number | null
          frame_rate?: number | null
          id?: string
          project_id?: string | null
          resolution?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          composition_data?: Json
          created_at?: string
          duration_ms?: number | null
          frame_rate?: number | null
          id?: string
          project_id?: string | null
          resolution?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timelines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_contacts: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contacted: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      track_items: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          media_item_id: string
          position_x: number | null
          position_y: number | null
          rotation: number | null
          scale: number | null
          start_time: number
          track_id: string
          updated_at: string | null
          z_index: number | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          id?: string
          media_item_id: string
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          scale?: number | null
          start_time?: number
          track_id: string
          updated_at?: string | null
          z_index?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          media_item_id?: string
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          scale?: number | null
          start_time?: number
          track_id?: string
          updated_at?: string | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "track_items_media_item_id_fkey"
            columns: ["media_item_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_items_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          created_at: string | null
          id: string
          label: string
          locked: boolean | null
          position: number
          project_id: string
          type: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label?: string
          locked?: boolean | null
          position?: number
          project_id: string
          type: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          locked?: boolean | null
          position?: number
          project_id?: string
          type?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_automation_preferences: {
        Row: {
          auto_retry_count: number
          checkpoint_frequency: string
          created_at: string | null
          id: string
          importance_threshold: number
          saved_decisions: Json | null
          timeout_seconds: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_retry_count?: number
          checkpoint_frequency?: string
          created_at?: string | null
          id?: string
          importance_threshold?: number
          saved_decisions?: Json | null
          timeout_seconds?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_retry_count?: number
          checkpoint_frequency?: string
          created_at?: string | null
          id?: string
          importance_threshold?: number
          saved_decisions?: Json | null
          timeout_seconds?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          id: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          artists: string[] | null
          keywords: string[] | null
          muted_words: string[] | null
          region: string | null
          sources_allow: string[] | null
          sources_block: string[] | null
          topics: string[] | null
          user_id: string
        }
        Insert: {
          artists?: string[] | null
          keywords?: string[] | null
          muted_words?: string[] | null
          region?: string | null
          sources_allow?: string[] | null
          sources_block?: string[] | null
          topics?: string[] | null
          user_id: string
        }
        Update: {
          artists?: string[] | null
          keywords?: string[] | null
          muted_words?: string[] | null
          region?: string | null
          sources_allow?: string[] | null
          sources_block?: string[] | null
          topics?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_secrets: {
        Row: {
          created_at: string
          encrypted_value: string
          id: string
          secret_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          id?: string
          secret_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          id?: string
          secret_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_bookings: {
        Row: {
          ai_match_score: number | null
          ai_reasoning: string | null
          contract_signed_at: string | null
          contract_url: string | null
          created_at: string | null
          event_date: string | null
          event_time: string | null
          gig_id: string | null
          id: string
          invoice_id: string | null
          metadata: Json | null
          offer_amount: number | null
          offer_sent_at: string | null
          payment_received_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          venue_capacity: number | null
          venue_city: string | null
          venue_contact_email: string | null
          venue_location: string | null
          venue_name: string
          venue_state: string | null
          workflow_stage: string | null
        }
        Insert: {
          ai_match_score?: number | null
          ai_reasoning?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          event_date?: string | null
          event_time?: string | null
          gig_id?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          offer_amount?: number | null
          offer_sent_at?: string | null
          payment_received_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          venue_capacity?: number | null
          venue_city?: string | null
          venue_contact_email?: string | null
          venue_location?: string | null
          venue_name: string
          venue_state?: string | null
          workflow_stage?: string | null
        }
        Update: {
          ai_match_score?: number | null
          ai_reasoning?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          event_date?: string | null
          event_time?: string | null
          gig_id?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          offer_amount?: number | null
          offer_sent_at?: string | null
          payment_received_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          venue_capacity?: number | null
          venue_city?: string | null
          venue_contact_email?: string | null
          venue_location?: string | null
          venue_name?: string
          venue_state?: string | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_bookings_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_bookings_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_searches: {
        Row: {
          created_at: string | null
          extracted_filters: Json | null
          id: string
          query: string
          results: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_filters?: Json | null
          id?: string
          query: string
          results?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_filters?: Json | null
          id?: string
          query?: string
          results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          name: string
          state: string | null
          updated_at: string | null
          venue_type: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          name: string
          state?: string | null
          updated_at?: string | null
          venue_type?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          name?: string
          state?: string | null
          updated_at?: string | null
          venue_type?: string | null
        }
        Relationships: []
      }
      video_clips: {
        Row: {
          created_at: string
          duration_ms: number | null
          end_time_ms: number | null
          id: string
          layer: number | null
          metadata: Json | null
          name: string
          project_id: string
          start_time_ms: number | null
          storage_bucket: string
          storage_path: string
          thumbnail_bucket: string | null
          thumbnail_path: string | null
          transforms: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          end_time_ms?: number | null
          id?: string
          layer?: number | null
          metadata?: Json | null
          name: string
          project_id: string
          start_time_ms?: number | null
          storage_bucket: string
          storage_path: string
          thumbnail_bucket?: string | null
          thumbnail_path?: string | null
          transforms?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          end_time_ms?: number | null
          id?: string
          layer?: number | null
          metadata?: Json | null
          name?: string
          project_id?: string
          start_time_ms?: number | null
          storage_bucket?: string
          storage_path?: string
          thumbnail_bucket?: string | null
          thumbnail_path?: string | null
          transforms?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_clips_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_highlights: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      voice_clones: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string
          voice_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
          voice_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          badges: Json | null
          created_at: string | null
          email: string
          id: string
          instagram: string | null
          ip_address: string | null
          name: string
          phone: string | null
          referral_code: string | null
          referral_source: string | null
          shared_count: number | null
          user_agent: string | null
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          email: string
          id?: string
          instagram?: string | null
          ip_address?: string | null
          name: string
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          shared_count?: number | null
          user_agent?: string | null
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          instagram?: string | null
          ip_address?: string | null
          name?: string
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          shared_count?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      wallet_flow_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          model: string | null
          role: string
          session_id: string
          tokens_used: number | null
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          model?: string | null
          role: string
          session_id: string
          tokens_used?: number | null
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          model?: string | null
          role?: string
          session_id?: string
          tokens_used?: number | null
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_flow_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "wallet_flow_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_flow_sessions: {
        Row: {
          agent_balance: number
          agent_wallet_address: string
          created_at: string
          current_stage: number
          id: string
          last_message_at: string | null
          metadata: Json | null
          seller_balance: number
          seller_wallet_address: string
          session_identifier: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_balance?: number
          agent_wallet_address: string
          created_at?: string
          current_stage?: number
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          seller_balance?: number
          seller_wallet_address: string
          session_identifier: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_balance?: number
          agent_wallet_address?: string
          created_at?: string
          current_stage?: number
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          seller_balance?: number
          seller_wallet_address?: string
          session_identifier?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          nonce: string | null
          signature: string | null
          user_id: string
          wallet_address: string
          wallet_type: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          nonce?: string | null
          signature?: string | null
          user_id: string
          wallet_address: string
          wallet_type?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          nonce?: string | null
          signature?: string | null
          user_id?: string
          wallet_address?: string
          wallet_type?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          asset_symbol: string
          created_at: string
          id: string
          metadata: Json | null
          status: string
          transaction_hash: string | null
          transaction_type: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          asset_symbol: string
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          transaction_hash?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          asset_symbol?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          transaction_hash?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      workflow_actions: {
        Row: {
          action_data: Json | null
          action_type: string
          checkpoint_config: Json | null
          confidence_score: number | null
          created_at: string
          description: string | null
          estimated_time_seconds: number | null
          id: string
          instructions: string | null
          name: string
          order_index: number | null
          tags: string[] | null
          thumbnail_url: string | null
          understanding_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions?: string | null
          name: string
          order_index?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          understanding_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions?: string | null
          name?: string
          order_index?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          understanding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_understanding_id_fkey"
            columns: ["understanding_id"]
            isOneToOne: false
            referencedRelation: "workflow_understandings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_understandings: {
        Row: {
          actions_identified: number | null
          analysis_summary: string | null
          confidence_score: number | null
          created_at: string
          id: string
          manus_response: Json | null
          processed_data: Json | null
          recording_id: string
          status: string
          updated_at: string
        }
        Insert: {
          actions_identified?: number | null
          analysis_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          manus_response?: Json | null
          processed_data?: Json | null
          recording_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          actions_identified?: number | null
          analysis_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          manus_response?: Json | null
          processed_data?: Json | null
          recording_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_understandings_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          credit_amount: number
          metadata?: Json
          transaction_type?: string
        }
        Returns: boolean
      }
      calculate_gig_revenue: {
        Args: { gig_id_param: string }
        Returns: {
          door_split_estimate: number
          guaranteed: number
          ticket_revenue: number
          total_potential: number
        }[]
      }
      check_rate_limit: {
        Args: { func_name: string; max_calls?: number; window_minutes?: number }
        Returns: boolean
      }
      generate_board_slug: { Args: { board_title: string }; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      get_available_credits: { Args: never; Returns: number }
      get_dashboard_stats: {
        Args: { user_id_param: string }
        Returns: {
          avg_payment_days: number
          overdue_invoices_count: number
          pending_gigs: number
          total_contacts: number
          total_gigs: number
          total_revenue: number
          total_venues: number
          unpaid_invoices_amount: number
          unpaid_invoices_count: number
          upcoming_gigs: number
        }[]
      }
      get_public_waitlist_count: { Args: never; Returns: number }
      get_recent_signups_admin: {
        Args: { limit_count?: number }
        Returns: {
          display_name: string
          signup_time: string
        }[]
      }
      get_waitlist_activity: {
        Args: never
        Returns: {
          period: string
          signup_count: number
        }[]
      }
      get_waitlist_count: { Args: never; Returns: number }
      is_authenticated_user: {
        Args: { requested_user_id: string }
        Returns: boolean
      }
      log_waitlist_access: {
        Args: { access_type: string; ip_address?: string; user_agent?: string }
        Returns: undefined
      }
      use_credits: {
        Args: { credit_cost?: number; metadata?: Json; resource_type: string }
        Returns: boolean
      }
      user_has_board_access: {
        Args: { board_id_param: string; user_id_param: string }
        Returns: boolean
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
