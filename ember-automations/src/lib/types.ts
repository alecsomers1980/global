export type QuestionType =
  | "text" | "long" | "select" | "multiselect"
  | "url" | "email" | "number" | "file" | "moscow";

export type ModuleId = "A" | "B";

export type MoscowTag = "Must" | "Should" | "Could" | "Not-yet";

export interface Question {
  id: string;              // stable, e.g. "core.goal", "A.pages"
  module: "core" | ModuleId;
  label: string;
  help?: string;
  type: QuestionType;
  options?: string[];      // select/multiselect options, or moscow candidate features
  required: boolean;
  critical: boolean;       // ⏳ — blocks quoting if unanswered
  round: number;           // 1 = initial; 2+ = follow-up rounds
}

export type AnswerScalar = string | string[] | number | Record<string, MoscowTag> | null;
export interface AnswerValue { value: AnswerScalar; round: number; saved_at: string; }

export type QuestionnaireType = "website" | "tool" | "existing";
export type QuestionnaireStatus =
  | "draft" | "sent" | "in_progress" | "submitted" | "follow_up" | "ready_to_quote";

export interface Questionnaire {
  id: string;
  slug: string;
  client_name: string;
  project_name: string;
  type: QuestionnaireType;
  status: QuestionnaireStatus;
  question_set: Question[];
  answers: Record<string, AnswerValue>;
  created_at: string;
  updated_at: string;
}
