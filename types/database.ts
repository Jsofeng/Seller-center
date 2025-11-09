export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          website: string | null;
          bio: string | null;
          avatar_url: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          website?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          website?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          status: "draft" | "published" | "archived";
          inventory: number | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          status?: "draft" | "published" | "archived";
          inventory?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          status?: "draft" | "published" | "archived";
          inventory?: number | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey";
            columns: ["seller_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Enums: {
      product_status: "draft" | "published" | "archived";
    };
  };
}

