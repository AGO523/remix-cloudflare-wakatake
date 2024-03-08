/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import { arts } from "db/schema";
import { InferInsertModel } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";

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
  const response = await db.insert(arts).values(newArt).execute();
  if (response.success) {
    return json({ message: "作品を投稿しました" }, { status: 201 });
  } else {
    return json({ message: "作品の投稿に失敗しました" }, { status: 500 });
  }
}
