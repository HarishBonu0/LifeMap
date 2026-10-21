-- ==============================================================================
-- LifeMap Database Migration 02: User-Scoped Tables and Row Level Security (RLS)
-- Enables strict multi-tenant isolation where users can only access their own data.
-- ==============================================================================

-- 1. PROFILES TABLE
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

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. ASSESSMENT SESSIONS TABLE (Randomized Financial Mindset Assessment)
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'financial_mindset',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  question_ids TEXT[] NOT NULL DEFAULT '{}',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(6, 2) DEFAULT 0,
  mindset_category TEXT,
  summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessment sessions" ON public.assessment_sessions;
CREATE POLICY "Users can view own assessment sessions" 
  ON public.assessment_sessions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment sessions" ON public.assessment_sessions;
CREATE POLICY "Users can insert own assessment sessions" 
  ON public.assessment_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessment sessions" ON public.assessment_sessions;
CREATE POLICY "Users can update own assessment sessions" 
  ON public.assessment_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assessment sessions" ON public.assessment_sessions;
CREATE POLICY "Users can delete own assessment sessions" 
  ON public.assessment_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. ASSESSMENT ANSWERS TABLE (Persisted Answers per Question)
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  selected_option_index INTEGER NOT NULL,
  points_earned NUMERIC(6, 2) DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can view own assessment answers" 
  ON public.assessment_answers FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can insert own assessment answers" 
  ON public.assessment_answers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessment answers" ON public.assessment_answers;
CREATE POLICY "Users can update own assessment answers" 
  ON public.assessment_answers FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. GAME PROGRESS TABLE (Per-User Scores & Badges)
CREATE TABLE IF NOT EXISTS public.game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 1,
  high_score INTEGER NOT NULL DEFAULT 0,
  badges_earned TEXT[] NOT NULL DEFAULT '{}',
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own game progress" ON public.game_progress;
CREATE POLICY "Users can view own game progress" 
  ON public.game_progress FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game progress" ON public.game_progress;
CREATE POLICY "Users can insert own game progress" 
  ON public.game_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game progress" ON public.game_progress;
CREATE POLICY "Users can update own game progress" 
  ON public.game_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- 5. CHAT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Financial Guidance',
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'te', 'hi')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own chat conversations" 
  ON public.chat_conversations FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can insert own chat conversations" 
  ON public.chat_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own chat conversations" 
  ON public.chat_conversations FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete own chat conversations" 
  ON public.chat_conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" 
  ON public.chat_messages FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. GROWTH SCENARIOS TABLE
CREATE TABLE IF NOT EXISTS public.growth_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_name TEXT NOT NULL,
  description TEXT,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  difference_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.growth_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own growth scenarios" ON public.growth_scenarios;
CREATE POLICY "Users can view own growth scenarios" 
  ON public.growth_scenarios FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own growth scenarios" ON public.growth_scenarios;
CREATE POLICY "Users can insert own growth scenarios" 
  ON public.growth_scenarios FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own growth scenarios" ON public.growth_scenarios;
CREATE POLICY "Users can update own growth scenarios" 
  ON public.growth_scenarios FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own growth scenarios" ON public.growth_scenarios;
CREATE POLICY "Users can delete own growth scenarios" 
  ON public.growth_scenarios FOR DELETE 
  USING (auth.uid() = user_id);

-- Profile creation trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
