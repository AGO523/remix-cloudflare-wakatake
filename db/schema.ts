import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey().notNull(),
  profileId: text("profileId").notNull(),
  iconUrl: text("iconUrl"),
  displayName: text("displayName").notNull(),
  nickname: text("nickname"),
  // アバターはユーザーがアップするのではなく、用意されたアバターを選択する
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
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
  title: text("title").notNull().default("新規デッキ"),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// decks と１対多の関係の deckCodes テーブル
// status が main の場合、deck のメイン画像として使用する
// deckHistories で使用するコードを保存する
// deckHistories で使用する画像を保存する
export const deckCodes = sqliteTable("deckCodes", {
  id: integer("id").primaryKey().notNull(),
  deckId: integer("deckId").notNull(),
  // notNull にしたい
  historyId: integer("historyId"),
  status: text("status").notNull().default("sub"),
  code: text("code").notNull(),
  imageUrl: text("imageUrl").notNull().default(""),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// decks と１対多の関係の deckHistories テーブル
export const deckHistories = sqliteTable("deckHistories", {
  id: integer("id").primaryKey().notNull(),
  deckId: integer("deckId").notNull(),
  status: text("status").notNull().default("main"),
  content: text("content"),
  publish_id: text("publish_code").default(""),
  // 履歴に紐づけた cardImages の URL 履歴に対して1つ設定できる仕様
  cardImageUrl: text("cardImageUrl"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// TODO: remove later
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
