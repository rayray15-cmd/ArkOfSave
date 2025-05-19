export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          preferences: Json
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          preferences?: Json
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          preferences?: Json
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          date: string
          split_with?: string
          split_amount?: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category: string
          date: string
          split_with?: string
          split_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          category?: string
          date?: string
          split_with?: string
          split_amount?: number
          created_at?: string
        }
      }
      budget_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          category?: string
          created_at?: string
        }
      }
      recurring_payments: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          frequency: string
          next_due: string
          category?: string
          notes?: string
          variable_amount: boolean
          reminder_days: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          frequency: string
          next_due: string
          category?: string
          notes?: string
          variable_amount?: boolean
          reminder_days?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          frequency?: string
          next_due?: string
          category?: string
          notes?: string
          variable_amount?: boolean
          reminder_days?: number
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          color?: string
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          text: string
          done: boolean
          due?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          done?: boolean
          due?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          done?: boolean
          due?: string
          created_at?: string
        }
      }
      debts: {
        Row: {
          id: string
          user_id: string
          description: string
          total_amount: number
          remaining_amount: number
          date: string
          is_shared: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          total_amount: number
          remaining_amount: number
          date: string
          is_shared?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          total_amount?: number
          remaining_amount?: number
          date?: string
          is_shared?: boolean
          created_at?: string
        }
      }
      debt_payments: {
        Row: {
          id: string
          debt_id: string
          amount: number
          date: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          debt_id: string
          amount: number
          date: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          debt_id?: string
          amount?: number
          date?: string
          user_id?: string
          created_at?: string
        }
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
  }
}