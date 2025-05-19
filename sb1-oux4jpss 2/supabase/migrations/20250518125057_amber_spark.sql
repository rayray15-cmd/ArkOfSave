/*
  # Initial Database Schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
      - preferences (jsonb)
    
    - expenses
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - description (text)
      - amount (decimal)
      - category (text)
      - date (date)
      - split_with (uuid, nullable)
      - split_amount (decimal, nullable)
      - created_at (timestamp)
    
    - budget_goals
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - target_amount (decimal)
      - current_amount (decimal)
      - deadline (date)
      - category (text)
      - created_at (timestamp)
    
    - recurring_payments
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - description (text)
      - amount (decimal)
      - frequency (text)
      - next_due (date)
      - category (text)
      - notes (text)
      - variable_amount (boolean)
      - reminder_days (integer)
      - created_at (timestamp)
    
    - savings_goals
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - target_amount (decimal)
      - current_amount (decimal)
      - deadline (date)
      - color (text)
      - created_at (timestamp)
    
    - todos
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - text (text)
      - done (boolean)
      - due (date)
      - created_at (timestamp)
    
    - debts
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - description (text)
      - total_amount (decimal)
      - remaining_amount (decimal)
      - date (date)
      - is_shared (boolean)
      - created_at (timestamp)
    
    - debt_payments
      - id (uuid, primary key)
      - debt_id (uuid, foreign key)
      - amount (decimal)
      - date (date)
      - user_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new records
      - Update their own records
      - Delete their own records
    - Add policies for shared data between users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal NOT NULL CHECK (amount >= 0),
  category text NOT NULL,
  date date NOT NULL,
  split_with uuid REFERENCES users(id),
  split_amount decimal CHECK (split_amount >= 0),
  created_at timestamptz DEFAULT now()
);

-- Budget goals table
CREATE TABLE budget_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount decimal NOT NULL CHECK (target_amount > 0),
  current_amount decimal NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline date NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Recurring payments table
CREATE TABLE recurring_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal NOT NULL CHECK (amount >= 0),
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  next_due date NOT NULL,
  category text,
  notes text,
  variable_amount boolean DEFAULT false,
  reminder_days integer DEFAULT 7,
  created_at timestamptz DEFAULT now()
);

-- Savings goals table
CREATE TABLE savings_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount decimal NOT NULL CHECK (target_amount > 0),
  current_amount decimal NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline date NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Todos table
CREATE TABLE todos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  text text NOT NULL,
  done boolean DEFAULT false,
  due date,
  created_at timestamptz DEFAULT now()
);

-- Debts table
CREATE TABLE debts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  description text NOT NULL,
  total_amount decimal NOT NULL CHECK (total_amount > 0),
  remaining_amount decimal NOT NULL CHECK (remaining_amount >= 0),
  date date NOT NULL,
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Debt payments table
CREATE TABLE debt_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id uuid REFERENCES debts(id) ON DELETE CASCADE,
  amount decimal NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for expenses table
CREATE POLICY "Users can read own expenses and shared expenses" ON expenses
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = split_with
  );

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for budget goals table
CREATE POLICY "Users can read own budget goals" ON budget_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget goals" ON budget_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget goals" ON budget_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget goals" ON budget_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for recurring payments table
CREATE POLICY "Users can read own recurring payments" ON recurring_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring payments" ON recurring_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring payments" ON recurring_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring payments" ON recurring_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for savings goals table
CREATE POLICY "Users can read own savings goals" ON savings_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" ON savings_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" ON savings_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" ON savings_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for todos table
CREATE POLICY "Users can read own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for debts table
CREATE POLICY "Users can read own and shared debts" ON debts
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_shared = true AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert own debts" ON debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" ON debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" ON debts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for debt payments table
CREATE POLICY "Users can read payments for own and shared debts" ON debt_payments
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM debts
      WHERE debts.id = debt_id
      AND (debts.user_id = auth.uid() OR debts.is_shared = true)
    )
  );

CREATE POLICY "Users can insert payments" ON debt_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON debt_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments" ON debt_payments
  FOR DELETE USING (auth.uid() = user_id);