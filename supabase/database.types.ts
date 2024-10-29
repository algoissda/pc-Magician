Need to install the following packages:
supabase@1.207.9
Ok to proceed? (y) 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      build_coin: {
        Row: {
          coin: number | null
          email: string | null
          uid: string
        }
        Insert: {
          coin?: number | null
          email?: string | null
          uid: string
        }
        Update: {
          coin?: number | null
          email?: string | null
          uid?: string
        }
        Relationships: []
      }
      builds: {
        Row: {
          Case: string
          Cooler: string
          CPU: string
          created_at: string
          explanation: string | null
          HDD: string | null
          id: number
          MBoard: string
          Power: string
          RAM: string
          SSD: string | null
          total_price: number | null
          VGA: string
        }
        Insert: {
          Case: string
          Cooler: string
          CPU: string
          created_at?: string
          explanation?: string | null
          HDD?: string | null
          id?: number
          MBoard: string
          Power: string
          RAM: string
          SSD?: string | null
          total_price?: number | null
          VGA: string
        }
        Update: {
          Case?: string
          Cooler?: string
          CPU?: string
          created_at?: string
          explanation?: string | null
          HDD?: string | null
          id?: number
          MBoard?: string
          Power?: string
          RAM?: string
          SSD?: string | null
          total_price?: number | null
          VGA?: string
        }
        Relationships: []
      }
      comment: {
        Row: {
          content: string
          created_at: string
          id: number
          post_id: number
          uid: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          post_id: number
          uid?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          post_id?: number
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          content: string
          created_at: string
          id: number
          like: number
          title: string
          type: string
          uid: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          like: number
          title: string
          type: string
          uid?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          like?: number
          title?: string
          type?: string
          uid?: string
        }
        Relationships: []
      }
      post_like: {
        Row: {
          created_at: string
          id: number
          post_id: number
          uid: string
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
          uid?: string
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_like_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          explanation: string | null
          id: number
          image_url: string | null
          price: number | null
          product_name: string
          purpose: string | null
          type: string
        }
        Insert: {
          explanation?: string | null
          id?: number
          image_url?: string | null
          price?: number | null
          product_name: string
          purpose?: string | null
          type: string
        }
        Update: {
          explanation?: string | null
          id?: number
          image_url?: string | null
          price?: number | null
          product_name?: string
          purpose?: string | null
          type?: string
        }
        Relationships: []
      }
      saved_builds: {
        Row: {
          build_id: number
          created_at: string
          id: number
          uid: string
        }
        Insert: {
          build_id: number
          created_at?: string
          id?: number
          uid?: string
        }
        Update: {
          build_id?: number
          created_at?: string
          id?: number
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_build_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
