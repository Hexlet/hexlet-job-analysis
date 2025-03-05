CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_name_unique` ON `skills` (`name`);--> statement-breakpoint
CREATE TABLE `search_queries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`term` text NOT NULL,
	`vacancies_count` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_queries_term_unique` ON `search_queries` (`term`);--> statement-breakpoint
CREATE TABLE `search_query_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`search_query_id` integer NOT NULL,
	`vacancy_id` integer NOT NULL,
	FOREIGN KEY (`search_query_id`) REFERENCES `search_queries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vacancy_id`) REFERENCES `vacancies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `search_query_results_search_query_id_vacancy_id_unique` ON `search_query_results` (`search_query_id`,`vacancy_id`);--> statement-breakpoint
CREATE TABLE `vacancies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_id` text NOT NULL,
	`normalization_state` text NOT NULL,
	`description` text NOT NULL,
	`speciality` text,
	`position_level` text,
	`timestamp` text,
	`salary_from` integer,
	`salary_to` integer,
	`schedule_name` text,
	`area_name` text,
	`salary_currency` text,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vacancies_original_id_unique` ON `vacancies` (`original_id`);--> statement-breakpoint
CREATE TABLE `vacancy_skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vacancy_id` integer NOT NULL,
	`skill_id` integer NOT NULL,
	FOREIGN KEY (`vacancy_id`) REFERENCES `vacancies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE no action
);
