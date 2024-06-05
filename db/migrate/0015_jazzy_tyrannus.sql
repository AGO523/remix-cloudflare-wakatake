ALTER TABLE deckCodes ADD `imageUrl` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `decks` DROP COLUMN `code`;