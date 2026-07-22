import { createClient } from "@supabase/supabase-js";
import { defaultQuestions, type QuizQuestion } from "./content";

/* eslint-disable @typescript-eslint/no-explicit-any */

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  "";

const supabaseAnonKey =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function submitQuizToSupabase(payload: {
  name: string;
  organization: string;
  employeeNumber: string;
  score: number;
  total: number;
  valueType: string;
  values: string[];
  strengths: string[];
  visionText: string;
  answers: Array<{ questionId: string; selectedIndex: number; correct: boolean | null }>;
}) {
  if (!supabase) {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Submission failed");
    return response.json();
  }

  const { error } = await supabase.from("submissions").insert([
    {
      name: payload.name,
      organization: payload.organization,
      employee_number: payload.employeeNumber,
      cohort: "2026 상반기",
      score: payload.score,
      total: payload.total,
      value_type: payload.valueType,
      values_json: payload.values,
      strengths_json: payload.strengths,
      vision_text: payload.visionText,
      answers_json: payload.answers,
    },
  ]);

  if (error) throw error;
  return { saved: true };
}

export async function fetchQuizFromSupabase(): Promise<QuizQuestion[]> {
  if (!supabase) {
    const res = await fetch("/api/quiz").catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      if (data?.questions?.length) return data.questions;
    }
    return defaultQuestions;
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return defaultQuestions;
  }

  return data.map((q: any) => ({
    id: q.id,
    type: q.type,
    category: q.category,
    question: q.question,
    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    image: q.image,
    active: q.active,
    sortOrder: q.sort_order,
  }));
}

export async function fetchStatsFromSupabase() {
  if (!supabase) {
    const res = await fetch("/api/stats").catch(() => null);
    if (res?.ok) return res.json();
    return { published: false, count: 0, remaining: 10 };
  }

  const { data, error } = await supabase.rpc("get_public_stats");

  if (error || !Array.isArray(data) || data.length === 0) {
    return { published: false, count: 0, remaining: 10 };
  }

  const totalCount = Number(data[0]?.total_count || 0);
  const published = totalCount >= 10;
  const remaining = Math.max(0, 10 - totalCount);
  const valueStats = published
    ? data.filter((row: any) => row.value_type).map((row: any) => ({ valueType: row.value_type, count: Number(row.value_count || 0) }))
    : undefined;

  return {
    published,
    count: totalCount,
    remaining,
    values: valueStats,
  };
}

export async function fetchAdminSubmissionsFromSupabase() {
  if (!supabase) {
    const res = await fetch("/api/admin/data");
    if (!res.ok) throw new Error("Unauthorized or server error");
    return res.json();
  }

  const [subsRes, qRes] = await Promise.all([
    supabase.from("submissions").select("*").order("completed_at", { ascending: false }),
    supabase.from("questions").select("*").order("sort_order", { ascending: true }),
  ]);

  if (subsRes.error) throw subsRes.error;

  const submissions = (subsRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    organization: s.organization,
    employeeNumber: s.employee_number,
    cohort: s.cohort,
    score: s.score,
    total: s.total,
    valueType: s.value_type,
    values: typeof s.values_json === "string" ? JSON.parse(s.values_json) : (s.values_json || []),
    strengths: typeof s.strengths_json === "string" ? JSON.parse(s.strengths_json) : (s.strengths_json || []),
    visionText: s.vision_text || "",
    answers: typeof s.answers_json === "string" ? JSON.parse(s.answers_json) : (s.answers_json || []),
    completedAt: s.completed_at,
  }));

  const questions = (qRes.data || []).map((q: any) => ({
    id: q.id,
    type: q.type,
    category: q.category,
    question: q.question,
    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    image: q.image,
    active: q.active,
    sortOrder: q.sort_order,
  }));

  return { submissions, questions };
}

export async function deleteSubmissionFromSupabase(id: string) {
  if (!supabase) {
    const res = await fetch("/api/admin/data", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  }

  const { error } = await supabase.from("submissions").delete().eq("id", id);
  return !error;
}

export async function saveQuestionToSupabase(question: QuizQuestion) {
  if (!supabase) {
    const res = await fetch("/api/admin/data", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(question),
    });
    return res.ok;
  }

  const { error } = await supabase.from("questions").upsert({
    id: question.id,
    type: question.type,
    category: question.category,
    question: question.question,
    options: question.options,
    correct_index: question.correctIndex,
    explanation: question.explanation,
    image: question.image,
    active: question.active,
    sort_order: question.sortOrder,
  });

  return !error;
}
