import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey().notNull(),
  profileId: text("profileId").notNull(),
  iconUrl: text("iconUrl"),
  displayName: text("displayName").notNull(),
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
