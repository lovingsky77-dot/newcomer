CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'knowledge' NOT NULL,
	`category` text NOT NULL,
	`question` text NOT NULL,
	`options_json` text NOT NULL,
	`correct_index` integer,
	`explanation` text DEFAULT '' NOT NULL,
	`image` text,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`organization` text NOT NULL,
	`employee_number` text NOT NULL,
	`cohort` text DEFAULT 'current' NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`value_type` text NOT NULL,
	`values_json` text DEFAULT '[]' NOT NULL,
	`strengths_json` text DEFAULT '[]' NOT NULL,
	`vision_text` text DEFAULT '' NOT NULL,
	`answers_json` text NOT NULL,
	`completed_at` text NOT NULL
);
