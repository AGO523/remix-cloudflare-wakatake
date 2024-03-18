/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import { arts, artImages } from "db/schema";
import { InferInsertModel, eq, desc } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";

type CreateArt = InferInsertModel<typeof arts>;
type createArtImage = InferInsertModel<typeof artImages>;
type UpdateArt = {
  title: string;
  content: string;
  updatedAt: Date;
};

interface Env {
  DB: D1Database;
  COMAJI_API_BASE_URL: string;
  COMAJI_AUTH_KEY: string;
}

// api からのレスポンスは imageUrl ではなく url というキーで返る
interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
}

const createArtSchema = z.object({
  userId: z.number(),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(10000),
});

const updateArtSchema = z.object({
  artId: z.number(),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(10000),
});

const createArtImageSchema = z.object({
  artId: z.number(),
  imageUrl: z.string(),
  createdAt: z.date(),
});

export async function getArts(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  return await db
    .select()
    .from(arts)
    .orderBy(desc(arts.updatedAt), desc(arts.createdAt))
    .all();
}

export async function getArtsWithImages(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  // arts テーブルからすべての作品を取得
  const artsData = await db
    .select()
    .from(arts)
    .orderBy(desc(arts.updatedAt), desc(arts.createdAt))
    .all();

  // 各作品に対応する画像を取得
  const artsWithImages = await Promise.all(
    artsData.map(async (art) => {
      const images = await db
        .select()
        .from(artImages)
        .where(eq(artImages.artId, art.id))
        .all();

      return {
        ...art,
        images,
      };
    })
  );

  return artsWithImages;
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

  const formObject = {
    userId: Number(formData.get("userId")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };
  const result = createArtSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const newArt: CreateArt = {
    ...result.data,
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

  const formObject = {
    artId: Number(formData.get("artId")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };
  const result = updateArtSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const updatedArt: UpdateArt = {
    title: result.data.title,
    content: result.data.content,
    updatedAt: currentTime,
  };

  const response = await db
    .update(arts)
    .set(updatedArt)
    .where(eq(arts.id, result.data.artId))
    .execute();

  if (response.success) {
    return json({ message: "作品を更新しました" }, { status: 200 });
  }
  return json({ message: "作品の更新に失敗しました" }, { status: 500 });
}

export async function deleteArt(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const artId = Number(formData.get("artId"));

  const response = await db.delete(arts).where(eq(arts.id, artId)).execute();

  if (response.success) {
    return json(
      { message: "作品が削除されました", success: true },
      { status: 200 }
    );
  } else {
    return json(
      { message: "作品の削除に失敗しました", success: false },
      { status: 500 }
    );
  }
}

export async function uploadAndCreateArtImage(
  formData: FormData,
  context: AppLoadContext
) {
  // 画像をGCSにアップロード
  const uploadResponse = await uploadArtImage(formData, context);
  if (!uploadResponse.success) {
    return json({
      message: uploadResponse.message,
      success: uploadResponse.success,
    });
  }

  const newFormData = {
    artId: Number(formData.get("artId")),
    imageUrl: uploadResponse.url,
    createdAt: new Date(),
  };

  console.log("newFormData", newFormData);

  const result = createArtImageSchema.safeParse(newFormData);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  // 画像のURLをDBに保存
  const env = context.env as Env;
  const db = createClient(env.DB);
  const newArtImage: createArtImage = result.data;
  const response = await db.insert(artImages).values(newArtImage).execute();

  if (response.success) {
    return json({ message: "画像を作品に追加しました", success: true });
  }
  return json({ message: "画像の追加に失敗しました", success: false });
}

export async function uploadArtImage(
  formData: FormData,
  context: AppLoadContext
): Promise<UploadResponse> {
  const env = context.env as Env;
  const apiEndpoint = env.COMAJI_API_BASE_URL;
  const authKey = env.COMAJI_AUTH_KEY;

  console.log("apiEndpoint", apiEndpoint);
  console.log("authKey", authKey);

  const uploadFormData = new FormData();
  const imageFile = formData.get("image");

  if (imageFile && typeof imageFile !== "string") {
    uploadFormData.append("image", imageFile);
  } else {
    return {
      success: false,
      message: "画像ファイルが不正です。",
      url: "",
    };
  }

  const response = await fetch(`${apiEndpoint}/upload`, {
    method: "POST",
    body: uploadFormData,
    headers: {
      "X-Auth-Key": authKey,
    },
  });

  console.log("response", response.body);

  if (!response.ok) {
    return {
      success: false,
      message: "画像のアップロードに失敗しました。",
      url: "",
    };
  }

  const data = (await response.json()) as UploadResponse;
  return {
    success: true,
    message: "画像がアップロードされました",
    url: data.url,
  };
}
