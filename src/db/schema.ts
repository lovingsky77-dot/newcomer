import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  employeeNumber: text("employee_number").notNull(),
  cohort: text("cohort").notNull().default("current"),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  valueType: text("value_type").notNull(),
  valuesJson: text("values_json").notNull().default("[]"),
  strengthsJson: text("strengths_json").notNull().default("[]"),
  visionText: text("vision_text").notNull().default(""),
  answersJson: text("answers_json").notNull(),
  completedAt: text("completed_at").notNull(),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("knowledge"),
  category: text("category").notNull(),
  question: text("question").notNull(),
  optionsJson: text("options_json").notNull(),
  correctIndex: integer("correct_index"),
  explanation: text("explanation").notNull().default(""),
  image: text("image"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: text("updated_at").notNull(),
});
