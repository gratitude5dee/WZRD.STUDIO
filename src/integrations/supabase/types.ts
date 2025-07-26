export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      characters: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
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
      generations: {
        Row: {
          api_provider: string
          callback_received_at: string | null
          created_at: string
          external_request_id: string | null
          failure_reason: string | null
          id: string
          project_id: string | null
          request_payload: Json
          result_media_asset_id: string | null
          shot_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_provider: string
          callback_received_at?: string | null
          created_at?: string
          external_request_id?: string | null
          failure_reason?: string | null
          id?: string
          project_id?: string | null
          request_payload: Json
          result_media_asset_id?: string | null
          shot_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_provider?: string
          callback_received_at?: string | null
          created_at?: string
          external_request_id?: string | null
          failure_reason?: string | null
          id?: string
          project_id?: string | null
          request_payload?: Json
          result_media_asset_id?: string | null
          shot_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_result_media_asset_id_fkey"
            columns: ["result_media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
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
          end_time: number | null
          id: string
          media_type: string
          metadata: Json | null
          name: string
          project_id: string
          start_time: number | null
          status: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          end_time?: number | null
          id?: string
          media_type: string
          metadata?: Json | null
          name: string
          project_id: string
          start_time?: number | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          end_time?: number | null
          id?: string
          media_type?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          start_time?: number | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
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
      profiles: {
        Row: {
          ai_preferences: Json | null
          avatar_url: string | null
          claude_api_key: string | null
          connected_accounts: Json | null
          created_at: string
          id: string
          last_wallet_connection: string | null
          luma_api_key: string | null
          onboarding_completed: boolean
          personality_type: string | null
          updated_at: string
          uploaded_files: Json | null
          username: string | null
          wallet_address: string | null
          wallet_auth_token: string | null
          wallet_type: string | null
        }
        Insert: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          claude_api_key?: string | null
          connected_accounts?: Json | null
          created_at?: string
          id: string
          last_wallet_connection?: string | null
          luma_api_key?: string | null
          onboarding_completed?: boolean
          personality_type?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          username?: string | null
          wallet_address?: string | null
          wallet_auth_token?: string | null
          wallet_type?: string | null
        }
        Update: {
          ai_preferences?: Json | null
          avatar_url?: string | null
          claude_api_key?: string | null
          connected_accounts?: Json | null
          created_at?: string
          id?: string
          last_wallet_connection?: string | null
          luma_api_key?: string | null
          onboarding_completed?: boolean
          personality_type?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          username?: string | null
          wallet_address?: string | null
          wallet_auth_token?: string | null
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
      storylines: {
        Row: {
          created_at: string
          description: string
          full_story: string
          generated_by: string | null
          id: string
          is_selected: boolean | null
          project_id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          full_story: string
          generated_by?: string | null
          id?: string
          is_selected?: boolean | null
          project_id: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          full_story?: string
          generated_by?: string | null
          id?: string
          is_selected?: boolean | null
          project_id?: string
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
          transaction_type?: string
          metadata?: Json
        }
        Returns: boolean
      }
      get_available_credits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_authenticated_user: {
        Args: { requested_user_id: string }
        Returns: boolean
      }
      use_credits: {
        Args: { resource_type: string; credit_cost?: number; metadata?: Json }
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
