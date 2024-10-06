CREATE TABLE `cardReviews` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer,
	`singleCardId` integer NOT NULL,
	`content` text NOT NULL,
	`rating` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `singleCard` RENAME TO `singleCards`;