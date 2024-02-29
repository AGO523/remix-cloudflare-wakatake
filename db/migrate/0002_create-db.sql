-- Migration number: 0002 	 2024-02-29T11:34:56.577Z
CREATE TABLE `blogs` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
