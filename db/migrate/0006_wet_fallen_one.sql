CREATE TABLE `cardImages` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deckHistories` (
	`id` integer PRIMARY KEY NOT NULL,
	`deckId` integer NOT NULL,
	`status` text DEFAULT 'main' NOT NULL,
	`content` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deckImages` (
	`id` integer PRIMARY KEY NOT NULL,
	`deckId` integer NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `decks` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`code` text NOT NULL,
	`title` text DEFAULT '新規デッキ' NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
