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
    PostgrestVersion: "17.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          created_at: string
          hotline: string | null
          i18n: Json
          id: string
          kind: Database["public"]["Enums"]["agency_kind"]
          name_th: string
          published: boolean
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          hotline?: string | null
          i18n: Json
          id: string
          kind: Database["public"]["Enums"]["agency_kind"]
          name_th: string
          published?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          hotline?: string | null
          i18n?: Json
          id?: string
          kind?: Database["public"]["Enums"]["agency_kind"]
          name_th?: string
          published?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      cache_entries: {
        Row: {
          expires_at: string
          key: string
          value: Json
        }
        Insert: {
          expires_at: string
          key: string
          value: Json
        }
        Update: {
          expires_at?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      case_checklist_items: {
        Row: {
          case_id: string
          checked: boolean
          checked_at: string | null
          condition_label_th: string | null
          condition_status: Database["public"]["Enums"]["condition_status"]
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          last_verified: string
          requirement_id: string | null
          service_id: string
          sort_order: number
          source_url: string
          text_th: string
        }
        Insert: {
          case_id: string
          checked?: boolean
          checked_at?: string | null
          condition_label_th?: string | null
          condition_status?: Database["public"]["Enums"]["condition_status"]
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          last_verified: string
          requirement_id?: string | null
          service_id: string
          sort_order?: number
          source_url: string
          text_th: string
        }
        Update: {
          case_id?: string
          checked?: boolean
          checked_at?: string | null
          condition_label_th?: string | null
          condition_status?: Database["public"]["Enums"]["condition_status"]
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["requirement_kind"]
          last_verified?: string
          requirement_id?: string | null
          service_id?: string
          sort_order?: number
          source_url?: string
          text_th?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_checklist_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_checklist_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "service_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      case_origins: {
        Row: {
          case_id: string
          created_at: string
          point: unknown
          source: Database["public"]["Enums"]["origin_source"]
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          point: unknown
          source: Database["public"]["Enums"]["origin_source"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          point?: unknown
          source?: Database["public"]["Enums"]["origin_source"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_origins_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          appointment_at: string | null
          closed_at: string | null
          created_at: string
          depart_at: string | null
          expires_at: string
          family_link_id: string | null
          id: string
          incident_confirmed: boolean
          incident_point: unknown
          line_user_id: string | null
          locale: string
          mode: Database["public"]["Enums"]["case_mode"]
          office_id: string | null
          online_only: boolean
          parent_case_id: string | null
          push_cap: number
          push_count: number
          reminders_muted: boolean
          service_ids: unknown[]
          session_id: string | null
          slot_answers: Json
          smart_activated_at: string | null
          status: Database["public"]["Enums"]["case_status"]
          time_saved_min: number | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          appointment_at?: string | null
          closed_at?: string | null
          created_at?: string
          depart_at?: string | null
          expires_at?: string
          family_link_id?: string | null
          id?: string
          incident_confirmed?: boolean
          incident_point?: unknown
          line_user_id?: string | null
          locale?: string
          mode?: Database["public"]["Enums"]["case_mode"]
          office_id?: string | null
          online_only?: boolean
          parent_case_id?: string | null
          push_cap?: number
          push_count?: number
          reminders_muted?: boolean
          service_ids: unknown[]
          session_id?: string | null
          slot_answers?: Json
          smart_activated_at?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          time_saved_min?: number | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          appointment_at?: string | null
          closed_at?: string | null
          created_at?: string
          depart_at?: string | null
          expires_at?: string
          family_link_id?: string | null
          id?: string
          incident_confirmed?: boolean
          incident_point?: unknown
          line_user_id?: string | null
          locale?: string
          mode?: Database["public"]["Enums"]["case_mode"]
          office_id?: string | null
          online_only?: boolean
          parent_case_id?: string | null
          push_cap?: number
          push_count?: number
          reminders_muted?: boolean
          service_ids?: unknown[]
          session_id?: string | null
          slot_answers?: Json
          smart_activated_at?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          time_saved_min?: number | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_family_link_id_fkey"
            columns: ["family_link_id"]
            isOneToOne: false
            referencedRelation: "family_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_parent_case_id_fkey"
            columns: ["parent_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_reports: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          message_th: string
          office_id: string | null
          requirement_id: string | null
          resolved_at: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          message_th: string
          office_id?: string | null
          requirement_id?: string | null
          resolved_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          message_th?: string
          office_id?: string | null
          requirement_id?: string | null
          resolved_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "catalog_reports_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_reports_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "service_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_reports_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_review_log: {
        Row: {
          action: Database["public"]["Enums"]["review_action"]
          changed_fields: string[]
          entity_id: string
          entity_table: string
          id: number
          note: string | null
          reviewed_at: string
          reviewed_by: string
        }
        Insert: {
          action: Database["public"]["Enums"]["review_action"]
          changed_fields?: string[]
          entity_id: string
          entity_table: string
          id?: never
          note?: string | null
          reviewed_at?: string
          reviewed_by: string
        }
        Update: {
          action?: Database["public"]["Enums"]["review_action"]
          changed_fields?: string[]
          entity_id?: string
          entity_table?: string
          id?: never
          note?: string | null
          reviewed_at?: string
          reviewed_by?: string
        }
        Relationships: []
      }
      catalog_sources: {
        Row: {
          agency_id: string | null
          created_at: string
          excerpt_th: string
          id: string
          retrieved_on: string
          service_id: string | null
          source_url: string
          title_th: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          excerpt_th: string
          id?: string
          retrieved_on: string
          service_id?: string | null
          source_url: string
          title_th: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          excerpt_th?: string
          id?: string
          retrieved_on?: string
          service_id?: string | null
          source_url?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_sources_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_sources_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          granted_at: string
          id: string
          line_user_id: string
          policy_version: string
          purpose: Database["public"]["Enums"]["consent_purpose"]
          revoked_at: string | null
        }
        Insert: {
          granted_at?: string
          id?: string
          line_user_id: string
          policy_version: string
          purpose: Database["public"]["Enums"]["consent_purpose"]
          revoked_at?: string | null
        }
        Update: {
          granted_at?: string
          id?: string
          line_user_id?: string
          policy_version?: string
          purpose?: Database["public"]["Enums"]["consent_purpose"]
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_expiries: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          expires_on: string
          family_link_id: string | null
          id: string
          line_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          expires_on: string
          family_link_id?: string | null
          id?: string
          line_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          expires_on?: string
          family_link_id?: string | null
          id?: string
          line_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_expiries_family_link_id_fkey"
            columns: ["family_link_id"]
            isOneToOne: false
            referencedRelation: "family_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_expiries_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          case_id: string | null
          created_at: string
          id: number
          name: string
          props: Json
          session_id: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: never
          name: string
          props?: Json
          session_id?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: never
          name?: string
          props?: Json
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_links: {
        Row: {
          carer_line_user_id: string
          created_at: string
          id: string
          invite_token_hash: string | null
          member_label_th: string
          member_line_user_id: string | null
          status: Database["public"]["Enums"]["family_status"]
          updated_at: string
        }
        Insert: {
          carer_line_user_id: string
          created_at?: string
          id?: string
          invite_token_hash?: string | null
          member_label_th: string
          member_line_user_id?: string | null
          status?: Database["public"]["Enums"]["family_status"]
          updated_at?: string
        }
        Update: {
          carer_line_user_id?: string
          created_at?: string
          id?: string
          invite_token_hash?: string | null
          member_label_th?: string
          member_line_user_id?: string | null
          status?: Database["public"]["Enums"]["family_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_links_carer_line_user_id_fkey"
            columns: ["carer_line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_links_member_line_user_id_fkey"
            columns: ["member_line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          closed_agency_kinds:
            | Database["public"]["Enums"]["agency_kind"][]
            | null
          closed_office_ids: unknown[] | null
          created_at: string
          date: string
          id: string
          name_th: string
          source_url: string | null
        }
        Insert: {
          closed_agency_kinds?:
            | Database["public"]["Enums"]["agency_kind"][]
            | null
          closed_office_ids?: unknown[] | null
          created_at?: string
          date: string
          id?: string
          name_th: string
          source_url?: string | null
        }
        Update: {
          closed_agency_kinds?:
            | Database["public"]["Enums"]["agency_kind"][]
            | null
          closed_office_ids?: unknown[] | null
          created_at?: string
          date?: string
          id?: string
          name_th?: string
          source_url?: string | null
        }
        Relationships: []
      }
      jurisdictions: {
        Row: {
          area: unknown
          created_at: string
          id: string
          is_proxy: boolean
          kind: Database["public"]["Enums"]["jurisdiction_kind"]
          last_verified: string
          office_id: string
          source_url: string
          updated_at: string
        }
        Insert: {
          area: unknown
          created_at?: string
          id?: string
          is_proxy?: boolean
          kind: Database["public"]["Enums"]["jurisdiction_kind"]
          last_verified: string
          office_id: string
          source_url: string
          updated_at?: string
        }
        Update: {
          area?: unknown
          created_at?: string
          id?: string
          is_proxy?: boolean
          kind?: Database["public"]["Enums"]["jurisdiction_kind"]
          last_verified?: string
          office_id?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jurisdictions_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      line_link_states: {
        Row: {
          case_id: string
          expires_at: string
          nonce_hash: string
          state_hash: string
        }
        Insert: {
          case_id: string
          expires_at?: string
          nonce_hash: string
          state_hash: string
        }
        Update: {
          case_id?: string
          expires_at?: string
          nonce_hash?: string
          state_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_link_states_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      line_push_usage: {
        Row: {
          month: string
          push_count: number
        }
        Insert: {
          month: string
          push_count?: number
        }
        Update: {
          month?: string
          push_count?: number
        }
        Relationships: []
      }
      line_users: {
        Row: {
          blocked_at: string | null
          created_at: string
          free_smart_used_at: string | null
          id: string
          is_friend: boolean
          last_seen_at: string
          line_uid: string
          locale: string
          reminder_frequency: Database["public"]["Enums"]["reminder_frequency"]
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string
          free_smart_used_at?: string | null
          id?: string
          is_friend?: boolean
          last_seen_at?: string
          line_uid: string
          locale?: string
          reminder_frequency?: Database["public"]["Enums"]["reminder_frequency"]
        }
        Update: {
          blocked_at?: string | null
          created_at?: string
          free_smart_used_at?: string | null
          id?: string
          is_friend?: boolean
          last_seen_at?: string
          line_uid?: string
          locale?: string
          reminder_frequency?: Database["public"]["Enums"]["reminder_frequency"]
        }
        Relationships: []
      }
      line_webhook_events: {
        Row: {
          event_id: string
          received_at: string
        }
        Insert: {
          event_id: string
          received_at?: string
        }
        Update: {
          event_id?: string
          received_at?: string
        }
        Relationships: []
      }
      office_queue_slots: {
        Row: {
          available: number | null
          ends_at: string
          fetched_at: string
          id: string
          office_id: string
          service_id: string | null
          source: string
          starts_at: string
        }
        Insert: {
          available?: number | null
          ends_at: string
          fetched_at?: string
          id?: string
          office_id: string
          service_id?: string | null
          source: string
          starts_at: string
        }
        Update: {
          available?: number | null
          ends_at?: string
          fetched_at?: string
          id?: string
          office_id?: string
          service_id?: string | null
          source?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_queue_slots_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_queue_slots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          address_th: string
          agency_id: string
          booking_url: string | null
          created_at: string
          google_place_id: string | null
          i18n: Json
          id: string
          last_verified: string
          location: unknown
          name_th: string
          nearest_station_th: string | null
          opening_hours: Json
          phone: string | null
          published: boolean
          source_url: string
          updated_at: string
        }
        Insert: {
          address_th: string
          agency_id: string
          booking_url?: string | null
          created_at?: string
          google_place_id?: string | null
          i18n: Json
          id: string
          last_verified: string
          location: unknown
          name_th: string
          nearest_station_th?: string | null
          opening_hours: Json
          phone?: string | null
          published?: boolean
          source_url: string
          updated_at?: string
        }
        Update: {
          address_th?: string
          agency_id?: string
          booking_url?: string | null
          created_at?: string
          google_place_id?: string | null
          i18n?: Json
          id?: string
          last_verified?: string
          location?: unknown
          name_th?: string
          nearest_station_th?: string | null
          opening_hours?: Json
          phone?: string | null
          published?: boolean
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offices_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_ledger: {
        Row: {
          case_id: string | null
          counterpart_wallet_id: string | null
          created_at: string
          delta: number
          expires_at: string | null
          id: number
          payment_id: string | null
          reason: Database["public"]["Enums"]["ledger_reason"]
          sponsor_code_hash: string | null
          wallet_id: string
        }
        Insert: {
          case_id?: string | null
          counterpart_wallet_id?: string | null
          created_at?: string
          delta: number
          expires_at?: string | null
          id?: never
          payment_id?: string | null
          reason: Database["public"]["Enums"]["ledger_reason"]
          sponsor_code_hash?: string | null
          wallet_id: string
        }
        Update: {
          case_id?: string | null
          counterpart_wallet_id?: string | null
          created_at?: string
          delta?: number
          expires_at?: string | null
          id?: never
          payment_id?: string | null
          reason?: Database["public"]["Enums"]["ledger_reason"]
          sponsor_code_hash?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pass_ledger_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_ledger_counterpart_wallet_id_fkey"
            columns: ["counterpart_wallet_id"]
            isOneToOne: false
            referencedRelation: "pass_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_ledger_sponsor_code_hash_fkey"
            columns: ["sponsor_code_hash"]
            isOneToOne: false
            referencedRelation: "sponsor_codes"
            referencedColumns: ["code_hash"]
          },
          {
            foreignKeyName: "pass_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "pass_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name_th: string
          passes: number
          price_satang: number
          valid_months: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          name_th: string
          passes: number
          price_satang: number
          valid_months?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name_th?: string
          passes?: number
          price_satang?: number
          valid_months?: number
        }
        Relationships: []
      }
      pass_wallets: {
        Row: {
          created_at: string
          id: string
          line_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          line_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pass_wallets_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: true
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          event_id: string
          provider: string
          received_at: string
        }
        Insert: {
          event_id: string
          provider: string
          received_at?: string
        }
        Update: {
          event_id?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_satang: number
          created_at: string
          currency: string
          id: string
          line_user_id: string | null
          paid_at: string | null
          product_id: string
          provider: string
          provider_ref: string
          receipt_url: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_satang: number
          created_at?: string
          currency?: string
          id?: string
          line_user_id?: string | null
          paid_at?: string | null
          product_id: string
          provider: string
          provider_ref: string
          receipt_url?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_satang?: number
          created_at?: string
          currency?: string
          id?: string
          line_user_id?: string | null
          paid_at?: string | null
          product_id?: string
          provider?: string
          provider_ref?: string
          receipt_url?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pass_products"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          hits: number
          key: string
          window_start: string
        }
        Update: {
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          attempts: number
          case_id: string | null
          created_at: string
          dedupe_key: string
          document_expiry_id: string | null
          id: string
          kind: Database["public"]["Enums"]["reminder_kind"]
          last_error: string | null
          send_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          case_id?: string | null
          created_at?: string
          dedupe_key: string
          document_expiry_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["reminder_kind"]
          last_error?: string | null
          send_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          case_id?: string | null
          created_at?: string
          dedupe_key?: string
          document_expiry_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["reminder_kind"]
          last_error?: string | null
          send_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_document_expiry_id_fkey"
            columns: ["document_expiry_id"]
            isOneToOne: false
            referencedRelation: "document_expiries"
            referencedColumns: ["id"]
          },
        ]
      }
      route_legs: {
        Row: {
          arrive_at: string | null
          distance_m: number | null
          duration_s: number | null
          id: string
          route_plan_id: string
          seq: number
          steps: Json
          to_office_id: string | null
          travel_mode: Database["public"]["Enums"]["travel_mode"]
          within_hours: boolean | null
        }
        Insert: {
          arrive_at?: string | null
          distance_m?: number | null
          duration_s?: number | null
          id?: string
          route_plan_id: string
          seq: number
          steps?: Json
          to_office_id?: string | null
          travel_mode: Database["public"]["Enums"]["travel_mode"]
          within_hours?: boolean | null
        }
        Update: {
          arrive_at?: string | null
          distance_m?: number | null
          duration_s?: number | null
          id?: string
          route_plan_id?: string
          seq?: number
          steps?: Json
          to_office_id?: string | null
          travel_mode?: Database["public"]["Enums"]["travel_mode"]
          within_hours?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "route_legs_route_plan_id_fkey"
            columns: ["route_plan_id"]
            isOneToOne: false
            referencedRelation: "route_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_legs_to_office_id_fkey"
            columns: ["to_office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      route_plans: {
        Row: {
          arrive_by: string | null
          baseline_duration_s: number | null
          buffer_min: number
          case_id: string
          computed_at: string
          depart_at: string | null
          distance_m: number | null
          duration_s: number | null
          encoded_polyline: string | null
          id: string
          is_chain: boolean
          is_fallback: boolean
          office_id: string | null
          rerouted_at: string | null
          summary_th: string | null
          traffic_aware: boolean
          travel_mode: Database["public"]["Enums"]["travel_mode"]
        }
        Insert: {
          arrive_by?: string | null
          baseline_duration_s?: number | null
          buffer_min?: number
          case_id: string
          computed_at?: string
          depart_at?: string | null
          distance_m?: number | null
          duration_s?: number | null
          encoded_polyline?: string | null
          id?: string
          is_chain?: boolean
          is_fallback?: boolean
          office_id?: string | null
          rerouted_at?: string | null
          summary_th?: string | null
          traffic_aware?: boolean
          travel_mode: Database["public"]["Enums"]["travel_mode"]
        }
        Update: {
          arrive_by?: string | null
          baseline_duration_s?: number | null
          buffer_min?: number
          case_id?: string
          computed_at?: string
          depart_at?: string | null
          distance_m?: number | null
          duration_s?: number | null
          encoded_polyline?: string | null
          id?: string
          is_chain?: boolean
          is_fallback?: boolean
          office_id?: string | null
          rerouted_at?: string | null
          summary_th?: string | null
          traffic_aware?: boolean
          travel_mode?: Database["public"]["Enums"]["travel_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "route_plans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_plans_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      service_links: {
        Row: {
          active: boolean
          condition: Json | null
          condition_label_th: string | null
          created_at: string
          from_service_id: string
          i18n: Json
          id: string
          sort_order: number
          to_service_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          condition?: Json | null
          condition_label_th?: string | null
          created_at?: string
          from_service_id: string
          i18n: Json
          id?: string
          sort_order?: number
          to_service_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          condition?: Json | null
          condition_label_th?: string | null
          created_at?: string
          from_service_id?: string
          i18n?: Json
          id?: string
          sort_order?: number
          to_service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_links_from_service_id_fkey"
            columns: ["from_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_links_to_service_id_fkey"
            columns: ["to_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requirements: {
        Row: {
          active: boolean
          condition: Json | null
          condition_label_th: string | null
          copies: number | null
          copy_type: Database["public"]["Enums"]["copy_type"]
          created_at: string
          i18n: Json
          id: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          service_id: string
          sort_order: number
          text_th: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          condition?: Json | null
          condition_label_th?: string | null
          copies?: number | null
          copy_type?: Database["public"]["Enums"]["copy_type"]
          created_at?: string
          i18n: Json
          id?: string
          kind: Database["public"]["Enums"]["requirement_kind"]
          service_id: string
          sort_order?: number
          text_th: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          condition?: Json | null
          condition_label_th?: string | null
          copies?: number | null
          copy_type?: Database["public"]["Enums"]["copy_type"]
          created_at?: string
          i18n?: Json
          id?: string
          kind?: Database["public"]["Enums"]["requirement_kind"]
          service_id?: string
          sort_order?: number
          text_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requirements_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          agency_id: string
          can_complete_online: boolean
          created_at: string
          duration_min: number | null
          example_phrases: string[]
          fee_note_th: string | null
          fee_thb: number | null
          hotline: string | null
          i18n: Json
          id: string
          last_verified: string
          name_th: string
          office_rule: Database["public"]["Enums"]["office_rule"]
          online_channel_name_th: string | null
          online_channel_url: string | null
          published: boolean
          source_url: string
          synonyms: string[]
          triage_questions: Json
          updated_at: string
        }
        Insert: {
          agency_id: string
          can_complete_online?: boolean
          created_at?: string
          duration_min?: number | null
          example_phrases?: string[]
          fee_note_th?: string | null
          fee_thb?: number | null
          hotline?: string | null
          i18n: Json
          id: string
          last_verified: string
          name_th: string
          office_rule: Database["public"]["Enums"]["office_rule"]
          online_channel_name_th?: string | null
          online_channel_url?: string | null
          published?: boolean
          source_url: string
          synonyms?: string[]
          triage_questions?: Json
          updated_at?: string
        }
        Update: {
          agency_id?: string
          can_complete_online?: boolean
          created_at?: string
          duration_min?: number | null
          example_phrases?: string[]
          fee_note_th?: string | null
          fee_thb?: number | null
          hotline?: string | null
          i18n?: Json
          id?: string
          last_verified?: string
          name_th?: string
          office_rule?: Database["public"]["Enums"]["office_rule"]
          online_channel_name_th?: string | null
          online_channel_url?: string | null
          published?: boolean
          source_url?: string
          synonyms?: string[]
          triage_questions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          token_hash?: string
        }
        Relationships: []
      }
      sponsor_codes: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string
          max_redemptions: number
          passes_per_code: number
          redeemed_count: number
          sponsor_name: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at: string
          max_redemptions: number
          passes_per_code: number
          redeemed_count?: number
          sponsor_name: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          expires_at?: string
          max_redemptions?: number
          passes_per_code?: number
          redeemed_count?: number
          sponsor_name?: string
        }
        Relationships: []
      }
      sponsor_redemptions: {
        Row: {
          code_hash: string
          id: string
          redeemed_at: string
          wallet_id: string | null
        }
        Insert: {
          code_hash: string
          id?: string
          redeemed_at?: string
          wallet_id?: string | null
        }
        Update: {
          code_hash?: string
          id?: string
          redeemed_at?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_redemptions_code_hash_fkey"
            columns: ["code_hash"]
            isOneToOne: false
            referencedRelation: "sponsor_codes"
            referencedColumns: ["code_hash"]
          },
          {
            foreignKeyName: "sponsor_redemptions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "pass_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          case_id: string | null
          created_at: string
          id: string
          service_id: string | null
          trips_saved: number
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          trips_saved: number
        }
        Update: {
          case_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
          trips_saved?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      wait_reports: {
        Row: {
          created_at: string
          day_part: Database["public"]["Enums"]["day_part"]
          id: string
          office_id: string
          service_id: string | null
          visited_on: string
          wait_min: number
        }
        Insert: {
          created_at?: string
          day_part: Database["public"]["Enums"]["day_part"]
          id?: string
          office_id: string
          service_id?: string | null
          visited_on: string
          wait_min: number
        }
        Update: {
          created_at?: string
          day_part?: Database["public"]["Enums"]["day_part"]
          id?: string
          office_id?: string
          service_id?: string | null
          visited_on?: string
          wait_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "wait_reports_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wait_reports_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_due_cases: { Args: { p_today: string }; Returns: number }
      case_transition_allowed: {
        Args: {
          p_from: Database["public"]["Enums"]["case_status"]
          p_online_only: boolean
          p_to: Database["public"]["Enums"]["case_status"]
        }
        Returns: boolean
      }
      claim_push: {
        Args: { p_case_id?: string; p_monthly_budget: number }
        Returns: boolean
      }
      create_case_chain: {
        Args: { p_cases: Json; p_session_id: string }
        Returns: {
          r_case_id: string
          r_index: number
        }[]
      }
      delete_line_user_data: {
        Args: { p_line_user_id: string }
        Returns: undefined
      }
      find_jurisdictions: {
        Args: {
          p_border_m?: number
          p_kind: Database["public"]["Enums"]["jurisdiction_kind"]
          p_lat: number
          p_lng: number
        }
        Returns: {
          covers: boolean
          edge_distance_m: number
          is_proxy: boolean
          jurisdiction_id: string
          office_id: unknown
        }[]
      }
      nearest_offices: {
        Args: {
          p_agency_kind: Database["public"]["Enums"]["agency_kind"]
          p_lat: number
          p_limit?: number
          p_lng: number
        }
        Returns: {
          office_id: unknown
          straight_m: number
        }[]
      }
      purge_expired: { Args: { p_now: string }; Returns: Json }
      rate_limit_hit: {
        Args: { p_key: string; p_max: number; p_window_sec: number }
        Returns: {
          allowed: boolean
          retry_after_sec: number
        }[]
      }
      touch_session: { Args: { p_token_hash: string }; Returns: string }
    }
    Enums: {
      agency_kind:
        | "district"
        | "police"
        | "dlt"
        | "gov_app"
        | "city_report"
        | "land"
        | "social_security"
        | "consular"
        | "revenue"
        | "utility"
        | "other"
      case_mode: "free" | "smart"
      case_status:
        | "planned"
        | "booked"
        | "due"
        | "done"
        | "postponed"
        | "cancelled"
      condition_status: "always" | "met" | "unknown"
      consent_purpose: "line_link" | "reminders" | "survey"
      copy_type: "original" | "copy" | "original_and_copy" | "not_applicable"
      day_part: "morning" | "midday" | "afternoon"
      doc_type: "id_card" | "driving_licence" | "vehicle_tax" | "passport"
      family_status: "pending" | "active" | "revoked"
      jurisdiction_kind: "police_area" | "district_admin"
      ledger_reason:
        | "purchase"
        | "spend"
        | "refund"
        | "transfer_in"
        | "transfer_out"
        | "sponsor"
        | "free_first"
        | "expire"
      office_rule:
        | "incident_location"
        | "house_registration"
        | "any_office"
        | "online"
      origin_source: "gps" | "pin" | "search"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      reminder_frequency: "all" | "important_only" | "off"
      reminder_kind:
        | "d_minus_1"
        | "morning_of"
        | "unticked_docs"
        | "expiry"
        | "next_step"
        | "reroute"
        | "route_event"
        | "survey"
      reminder_status: "pending" | "sent" | "cancelled" | "failed"
      report_status: "open" | "accepted" | "rejected" | "fixed"
      requirement_kind: "before_go" | "document" | "step" | "remember"
      review_action:
        | "create"
        | "update"
        | "verify"
        | "publish"
        | "unpublish"
        | "delete"
      travel_mode: "TRANSIT" | "DRIVE" | "TWO_WHEELER" | "WALK"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agency_kind: [
        "district",
        "police",
        "dlt",
        "gov_app",
        "city_report",
        "land",
        "social_security",
        "consular",
        "revenue",
        "utility",
        "other",
      ],
      case_mode: ["free", "smart"],
      case_status: [
        "planned",
        "booked",
        "due",
        "done",
        "postponed",
        "cancelled",
      ],
      condition_status: ["always", "met", "unknown"],
      consent_purpose: ["line_link", "reminders", "survey"],
      copy_type: ["original", "copy", "original_and_copy", "not_applicable"],
      day_part: ["morning", "midday", "afternoon"],
      doc_type: ["id_card", "driving_licence", "vehicle_tax", "passport"],
      family_status: ["pending", "active", "revoked"],
      jurisdiction_kind: ["police_area", "district_admin"],
      ledger_reason: [
        "purchase",
        "spend",
        "refund",
        "transfer_in",
        "transfer_out",
        "sponsor",
        "free_first",
        "expire",
      ],
      office_rule: [
        "incident_location",
        "house_registration",
        "any_office",
        "online",
      ],
      origin_source: ["gps", "pin", "search"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      reminder_frequency: ["all", "important_only", "off"],
      reminder_kind: [
        "d_minus_1",
        "morning_of",
        "unticked_docs",
        "expiry",
        "next_step",
        "reroute",
        "route_event",
        "survey",
      ],
      reminder_status: ["pending", "sent", "cancelled", "failed"],
      report_status: ["open", "accepted", "rejected", "fixed"],
      requirement_kind: ["before_go", "document", "step", "remember"],
      review_action: [
        "create",
        "update",
        "verify",
        "publish",
        "unpublish",
        "delete",
      ],
      travel_mode: ["TRANSIT", "DRIVE", "TWO_WHEELER", "WALK"],
    },
  },
} as const
