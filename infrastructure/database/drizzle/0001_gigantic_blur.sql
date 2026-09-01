CREATE TABLE `education_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`file_name` text NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`uploaded_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `logistics_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`organization` text NOT NULL,
	`employee_number` text NOT NULL,
	`lodging_needed` text NOT NULL,
	`outbound_method` text NOT NULL,
	`return_method` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`submitted_at` text NOT NULL
);
