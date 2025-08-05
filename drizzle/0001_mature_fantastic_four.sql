CREATE TABLE `prototype-3_candidate_profiles_to_projects` (
	`candidate_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`candidate_id`, `project_id`),
	FOREIGN KEY (`candidate_id`) REFERENCES `prototype-3_candidate_profile`(`candidateId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `prototype-3_project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_candidates_to_projects` (
	`candidate_id` text NOT NULL,
	`project_id` text NOT NULL,
	PRIMARY KEY(`candidate_id`, `project_id`),
	FOREIGN KEY (`candidate_id`) REFERENCES `prototype-3_candidate`(`userId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `prototype-3_project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_projectSubmission` (
	`id` text PRIMARY KEY NOT NULL,
	`projectId` text NOT NULL,
	`submittedOn` integer DEFAULT (unixepoch()),
	`status` text DEFAULT 'submitted',
	`reviewedOn` integer,
	`reviewedBy` text(255) NOT NULL,
	`repoURL` text(255),
	`notes` text(255),
	FOREIGN KEY (`projectId`) REFERENCES `prototype-3_project`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewedBy`) REFERENCES `prototype-3_admin`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prototype-3_projects_tags` (
	`project_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `prototype-3_project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `prototype-3_tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(256)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prototype-3_tag_name_unique` ON `prototype-3_tag` (`name`);--> statement-breakpoint
CREATE TABLE `prototype-3_admin_profile` (
	`adminId` text(255) PRIMARY KEY NOT NULL,
	`displayName` text(255) NOT NULL,
	`bio` text(255),
	`imageURL` text(255),
	`contactEmail` text(255),
	FOREIGN KEY (`adminId`) REFERENCES `prototype-3_admin`(`userId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_admin` (
	`userId` text(255) PRIMARY KEY NOT NULL,
	`role` text DEFAULT 'Reg',
	FOREIGN KEY (`userId`) REFERENCES `prototype-3_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_userid_role_unique` ON `prototype-3_admin` (`userId`,`role`);--> statement-breakpoint
CREATE TABLE `prototype-3_candidate_profile` (
	`candidateId` text(255) PRIMARY KEY NOT NULL,
	`displayName` text(255) NOT NULL,
	`bio` text(255),
	`experience` text(255),
	`githubUsername` text(255),
	`portfolioURL` text(255),
	`linkedinURL` text(255),
	`imageURL` text(255),
	FOREIGN KEY (`candidateId`) REFERENCES `prototype-3_candidate`(`userId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_candidate` (
	`userId` text(255) PRIMARY KEY NOT NULL,
	`location` text(255),
	`language` text(255),
	`resumeURL` text(255),
	FOREIGN KEY (`userId`) REFERENCES `prototype-3_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_recruiter_profile` (
	`recruiterId` text(255) PRIMARY KEY NOT NULL,
	`displayName` text(255) NOT NULL,
	`companyName` text(255),
	`bio` text(255),
	`companyWebsite` text(255),
	`linkedinURL` text(255),
	`imageURL` text(255),
	`publicEmail` text(255),
	FOREIGN KEY (`recruiterId`) REFERENCES `prototype-3_recruiter`(`userId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_recruiter` (
	`userId` text(255) PRIMARY KEY NOT NULL,
	`companyName` text(255),
	`location` text(255),
	FOREIGN KEY (`userId`) REFERENCES `prototype-3_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prototype-3_recruiters_candidates` (
	`recruiter_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`comments` text DEFAULT '' NOT NULL,
	PRIMARY KEY(`candidate_id`, `recruiter_id`),
	FOREIGN KEY (`recruiter_id`) REFERENCES `prototype-3_recruiter`(`userId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`candidate_id`) REFERENCES `prototype-3_candidate`(`userId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `prototype-3_users_to_projects`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_prototype-3_project` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text(256),
	`subTitle` text(256),
	`description` text(256),
	`instructions` text(256),
	`requirements` text(256),
	`imageURL` text(256),
	`status` text DEFAULT 'in-progress',
	`deadline` integer,
	`startDateTime` integer,
	`endDateTime` integer,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	`createdBy` text(255),
	FOREIGN KEY (`createdBy`) REFERENCES `prototype-3_admin_profile`(`adminId`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_prototype-3_project`("id", "title", "subTitle", "description", "instructions", "requirements", "imageUrl", "status", "deadline", "startDateTime", "endDateTime", "createdAt", "updatedAt", "createdBy") SELECT "id", "title", "subTitle", "description", "instructions", "requirements", "imageURL", "status", "deadline", "startDateTime", "endDateTime", "createdAt", "updatedAt", "createdBy" FROM `prototype-3_project`;--> statement-breakpoint
DROP TABLE `prototype-3_project`;--> statement-breakpoint
ALTER TABLE `__new_prototype-3_project` RENAME TO `prototype-3_project`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `prototype-3_user` ADD `phoneNumber` text(255);--> statement-breakpoint
ALTER TABLE `prototype-3_user` ADD `role` text DEFAULT 'candidate';--> statement-breakpoint
ALTER TABLE `prototype-3_user` ADD `createdAt` integer DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `prototype-3_user` ADD `updatedAt` integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_role_unique` ON `prototype-3_user` (`id`,`role`);
