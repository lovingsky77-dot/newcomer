-- Supabase Schema for DAEDONG Great Journey Onboarding Website

-- 1. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '대동',
  employee_number TEXT NOT NULL,
  cohort TEXT NOT NULL DEFAULT '2026 하반기',
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 6,
  value_type TEXT NOT NULL,
  values_json JSONB DEFAULT '[]'::jsonb,
  strengths_json JSONB DEFAULT '[]'::jsonb,
  vision_text TEXT,
  answers_json JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow public select on submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow delete to submissions" ON public.submissions;

CREATE POLICY "Allow public insert to submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- Public visitors can only add their own result. Raw records remain private.
-- Aggregate statistics are exposed through a dedicated function below.

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT,
  explanation TEXT,
  image TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on questions" ON public.questions;
DROP POLICY IF EXISTS "Allow write to questions" ON public.questions;

CREATE POLICY "Allow public select on questions"
  ON public.questions FOR SELECT
  USING (true);

-- Question changes must go through the authenticated administrator API.

CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(total_count BIGINT, value_type TEXT, value_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH totals AS (
    SELECT COUNT(*)::BIGINT AS total_count FROM public.submissions
  ), grouped AS (
    SELECT submissions.value_type, COUNT(*)::BIGINT AS value_count
    FROM public.submissions
    GROUP BY submissions.value_type
  )
  SELECT
    totals.total_count,
    CASE WHEN totals.total_count >= 10 THEN grouped.value_type ELSE NULL END,
    CASE WHEN totals.total_count >= 10 THEN grouped.value_count ELSE NULL END
  FROM totals
  LEFT JOIN grouped ON totals.total_count >= 10;
$$;

REVOKE ALL ON FUNCTION public.get_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;

-- 3. Initial Seed Data for Questions
INSERT INTO public.questions (id, type, category, question, options, correct_index, explanation, image, sort_order)
VALUES
  ('history', 'knowledge', 'HERITAGE', '대동의 시작은 언제일까요?', '["1937년", "1947년", "1957년", "1967년"]'::jsonb, 1, '대동은 1947년 창업 이후 한국 농업의 기계화를 이끌어왔습니다.', NULL, 1),
  ('values', 'knowledge', 'VALUE', '대동의 핵심가치가 아닌 것은 무엇일까요?', '["창조", "신뢰", "안전", "열정"]'::jsonb, 2, '대동의 핵심가치는 창조, 신뢰, 열정, 책임입니다.', NULL, 2),
  ('future-five', 'knowledge', 'AI TO THE FIELD', '2026년 대동이 제시한 미래 5대 사업의 올바른 조합은?', '["정밀농업·로보틱스·스마트파밍·AI 에이전트·커넥티드", "농기계·금융·건설·항공·물류", "스마트폰·반도체·바이오·게임·로봇", "트랙터·이앙기·콤바인·경운기·엔진"]'::jsonb, 0, 'AI와 데이터, 로보틱스를 기반으로 다섯 사업의 경쟁력을 고도화하고 있습니다.', NULL, 3),
  ('future-three', 'knowledge', 'VISION', 'AI to the Field를 이루는 3대 핵심 축은?', '["AI 정밀농업·AI 스마트파밍·AI 필드로봇", "생산·영업·서비스", "서울·대구·창녕", "농업·금융·유통"]'::jsonb, 0, '세 핵심 축은 오퍼레이션 센터와 연결되어 농업의 AI 대전환을 만듭니다.', NULL, 4),
  ('machine', 'knowledge', 'MACHINE', '사진 속 대동의 자율작업 농기계는 무엇일까요?', '["콤바인", "트랙터", "이앙기", "스키드로더"]'::jsonb, 1, '트랙터는 경운부터 파종까지 다양한 농작업의 중심을 담당합니다.', '/images/future-04.png', 5),
  ('day-five', 'knowledge', 'JOURNEY', '5일차 여정을 완성하는 대표 프로그램은?', '["농기계 체험", "해외사업 소개", "자기비저닝", "모빌리티 신공장 투어"]'::jsonb, 0, 'DAY 5에는 비전캠퍼스에서 농기계를 직접 체험합니다.', NULL, 6),
  ('personality', 'personality', 'MY VALUE', '새로운 과제를 만났을 때 나는 어떤 사람에 가까운가요?', '["새로운 방법을 먼저 상상한다", "동료의 의견을 듣고 연결한다", "끝까지 에너지를 잃지 않는다", "맡은 결과를 확실하게 완성한다"]'::jsonb, NULL, '선택에는 정답이 없습니다. 지금의 나를 가장 잘 표현하는 문장을 골라보세요.', NULL, 7)
ON CONFLICT (id) DO NOTHING;
