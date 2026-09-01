CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`public_code` text NOT NULL,
	`token_hash` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_public_code_unique` ON `inquiries` (`public_code`);--> statement-breakpoint
CREATE INDEX `inquiries_status_updated_idx` ON `inquiries` (`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `inquiry_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`sender` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inquiry_messages_thread_idx` ON `inquiry_messages` (`inquiry_id`,`created_at`);