/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import { arts } from "db/schema";
import { InferInsertModel, eq } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";

type CreateArt = InferInsertModel<typeof arts>;
type UpdateArt = {
  title: string;
  content: string;
  updatedAt: Date;
};

// type Arts = {
//   id: number;
//   userId: number;
//   title: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

interface Env {
  DB: D1Database;
}

export async function getArts(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const artList = await db.select().from(arts).all();
  return artList;
}

export async function getArtBy(artId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const art = await db.select().from(arts).where(eq(arts.id, artId)).get();
  return art;
}

export async function createArt(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();
  const newArt: CreateArt = {
    userId: Number(formData.get("userId")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
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

export async function updateArt(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();
  const artId = Number(formData.get("artId"));
  const updatedArt: UpdateArt = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    updatedAt: currentTime,
  };
  const response = await db
    .update(arts)
    .set(updatedArt)
    .where(eq(arts.id, artId))
    .execute();
  if (response.success) {
    return json({ message: "作品を更新しました" }, { status: 200 });
  } else {
    return json({ message: "作品の更新に失敗しました" }, { status: 500 });
  }
}
