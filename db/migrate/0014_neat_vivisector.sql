CREATE TABLE `deckCodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`deckId` integer NOT NULL,
	`historyId` integer,
	`status` text DEFAULT 'sub' NOT NULL,
	`code` text NOT NULL,
	`createdAt` integer NOT NULL
);
