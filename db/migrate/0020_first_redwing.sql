CREATE TABLE `singleCard` (
	`id` integer PRIMARY KEY NOT NULL,
	`imageUrl` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`rule` text,
	`gameType` text NOT NULL,
	`createdAt` integer NOT NULL
);
