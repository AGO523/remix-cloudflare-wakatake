CREATE TABLE `cardImages` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`deckHistoryId` integer NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` integer NOT NULL
);
