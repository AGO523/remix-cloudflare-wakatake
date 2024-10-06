/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import { singleCards } from "db/schema";
import { InferInsertModel, desc } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";

type CreateSingleCard = InferInsertModel<typeof singleCards>;

interface Env {
  DB: D1Database;
}

export const createSingleCardSchema = z.object({
  imageUrl: z.string().optional(),
  name: z.string(),
  type: z.string(),
  rule: z.string().optional(),
  gameType: z.enum(["ポケモンカード", "ポケポケ"]),
  // userId は1のみ許可
  userId: z.number().refine((value) => value === 1, {
    message: "アクセス権限がありません",
  }),
});

export async function createSingleCard(
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const formObject = {
    userId: Number(formData.get("userId") || ""),
    imageUrl: formData.get("imageUrl") || undefined,
    name: formData.get("name") || "",
    type: formData.get("type") || "",
    rule: formData.get("rule") || undefined,
    gameType: formData.get("gameType") || "",
  };

  // Zod でバリデーションチェック
  const result = createSingleCardSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: "Invalid form data", errors: result.error.errors },
      { status: 400 }
    );
  }

  // 型がバリデーションされたデータを元に新しいカードを作成
  const newSingleCard: CreateSingleCard = {
    ...result.data,
    createdAt: new Date(),
  };

  // データベースへの挿入操作
  const response = await db.insert(singleCards).values(newSingleCard).execute();

  if (response.error) {
    return json({ message: "Failed to create single card" }, { status: 500 });
  }

  return json(
    { message: "Single card created successfully", data: newSingleCard },
    { status: 201 }
  );
}

export async function getSingleCards(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const singleCardsResponse = await db
    .select()
    .from(singleCards)
    .orderBy(desc(singleCards.createdAt))
    .all();

  if (!singleCardsResponse) {
    return [];
  }

  // 配列の形式で返す、mapを使用するため
  return singleCardsResponse;
}
