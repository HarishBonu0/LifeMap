-- LifeMap Database Schema (Team AspireX)
-- PostgreSQL with Row Level Security (RLS) enabled on all user tables

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
  age INTEGER,
  employment_type TEXT,
  marital_status TEXT,
  dependants_count INTEGER DEFAULT 0,
  is_demo_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Life Goals
CREATE TABLE IF NOT EXISTS public.life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'essential' CHECK (priority IN ('essential', 'high', 'medium', 'flexible')),
  target_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  target_years INTEGER NOT NULL DEFAULT 10,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.life_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life goals" 
  ON public.life_goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life goals" 
  ON public.life_goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life goals" 
  ON public.life_goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life goals" 
  ON public.life_goals FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Financial Assessments
CREATE TABLE IF NOT EXISTS public.financial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inputs JSONB NOT NULL,
  assumptions JSONB NOT NULL,
  calculated_results JSONB NOT NULL,
  calculation_version TEXT NOT NULL DEFAULT '2026.1-IN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.financial_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial assessments" 
  ON public.financial_assessments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial assessments" 
  ON public.financial_assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 4. Scenario Simulations
CREATE TABLE IF NOT EXISTS public.scenario_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_name TEXT NOT NULL,
  description TEXT,
  scenario_inputs JSONB NOT NULL,
  calculated_results JSONB NOT NULL,
  difference_amount NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scenario_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scenarios" 
  ON public.scenario_simulations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios" 
  ON public.scenario_simulations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 5. Learning Progress
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  high_score INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning progress" 
  ON public.learning_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own learning progress" 
  ON public.learning_progress FOR ALL 
  USING (auth.uid() = user_id);

-- 6. Chat History
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" 
  ON public.chat_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions" 
  ON public.chat_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. Verified Educational Insurance Product Categories (Public read-only)
CREATE TABLE IF NOT EXISTS public.educational_insurance_products (
  id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  description TEXT NOT NULL,
  typical_term_years TEXT,
  coverage_range TEXT,
  pricing_structure TEXT,
  key_benefits TEXT[],
  major_exclusions TEXT[],
  eligibility_conditions TEXT[],
  best_suited_for TEXT,
  source_of_info TEXT NOT NULL,
  last_verified_date DATE NOT NULL
);

ALTER TABLE public.educational_insurance_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view educational products" 
  ON public.educational_insurance_products FOR SELECT 
  TO authenticated, anon 
  USING (true);
