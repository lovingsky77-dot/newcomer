import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

export const logisticsResponses = sqliteTable("logistics_responses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  employeeNumber: text("employee_number").notNull(),
  lodgingNeeded: text("lodging_needed").notNull(),
  outboundMethod: text("outbound_method").notNull(),
  returnMethod: text("return_method").notNull(),
  note: text("note").notNull().default(""),
  submittedAt: text("submitted_at").notNull(),
}, (table) => [index("logistics_employee_idx").on(table.employeeNumber, table.submittedAt)]);

export const educationPhotos = sqliteTable("education_photos", {
  id: text("id").primaryKey(),
  objectKey: text("object_key").notNull(),
  contentType: text("content_type").notNull(),
  fileName: text("file_name").notNull(),
  caption: text("caption").notNull().default(""),
  uploadedAt: text("uploaded_at").notNull(),
}, (table) => [index("education_photos_uploaded_idx").on(table.uploadedAt)]);

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  publicCode: text("public_code").notNull(),
  tokenHash: text("token_hash").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("inquiries_public_code_unique").on(table.publicCode),
  index("inquiries_status_updated_idx").on(table.status, table.updatedAt),
]);

export const inquiryMessages = sqliteTable("inquiry_messages", {
  id: text("id").primaryKey(),
  inquiryId: text("inquiry_id").notNull(),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("inquiry_messages_thread_idx").on(table.inquiryId, table.createdAt)]);
