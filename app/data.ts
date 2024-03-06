/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import { arts } from "db/schema";
import { InferInsertModel } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";

type CreateArt = InferInsertModel<typeof arts>;

export async function createArt(formData: FormData, env: { DB: D1Database }) {
  const db = createClient(env.DB);
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;
  const currentTime = new Date();
  const newArt: CreateArt = {
    userId: Number(userId),
    content,
    createdAt: currentTime,
    updatedAt: currentTime,
  };
  const response = await db.insert(arts).values(newArt).returning().get();
  return response;
}
