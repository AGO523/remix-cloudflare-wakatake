import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey().notNull(),
  profileId: text("profileId").notNull(),
  iconUrl: text("iconUrl"),
  displayName: text("displayName").notNull(),
  // nickname: text("nickname"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const arts = sqliteTable("arts", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("userId").notNull(),
  title: text("title").notNull().default("アートラの作品"),
  content: text("content").notNull(),
  price: integer("price").notNull().default(0),
  productUrl: text("productUrl"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// arts と１対多の関係の artImages テーブル
export const artImages = sqliteTable("artImages", {
  id: integer("id").primaryKey().notNull(),
  artId: integer("artId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const dialies = sqliteTable("dialies", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("userId").notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const decks = sqliteTable("decks", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("userId").notNull(),
  code: text("code").notNull(),
  title: text("title").notNull().default("新規デッキ"),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// decks と１対多の関係の deckHistories テーブル
export const deckHistories = sqliteTable("deckHistories", {
  id: integer("id").primaryKey().notNull(),
  deckId: integer("deckId").notNull(),
  status: text("status").notNull().default("main"),
  content: text("content"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// decks と１対多の関係の deckImages テーブル
export const deckImages = sqliteTable("deckImages", {
  id: integer("id").primaryKey().notNull(),
  deckId: integer("deckId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// users と１対多の関係の cardImages テーブル
// deckHistories で使用する画像を保存する
// ユーザーはこのテーブルに画像を事前にアップロードして、デッキの履歴に使用する
export const cardImages = sqliteTable("cardImages", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
