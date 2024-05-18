/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import {
  arts,
  artImages,
  dialies,
  decks,
  deckHistories,
  deckImages,
} from "db/schema";
import { InferInsertModel, eq, desc } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { DrizzleD1Database } from "drizzle-orm/d1";

type CreateArt = InferInsertModel<typeof arts>;
type createArtImage = InferInsertModel<typeof artImages>;
type CreateDialy = InferInsertModel<typeof dialies>;
type CreateDeck = InferInsertModel<typeof decks>;
type CreateDeckHistory = InferInsertModel<typeof deckHistories>;
type CreateDeckImage = InferInsertModel<typeof deckImages>;

type UpdateArt = {
  title: string;
  content: string;
  price: number;
  productUrl: string;
  updatedAt: Date;
};

interface Env {
  DB: D1Database;
  C_API_BASE_URL: string;
  C_AUTH_KEY: string;
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
  price: z.number(),
  productUrl: z.string().optional(),
});

const updateArtSchema = z.object({
  artId: z.number(),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(10000),
  price: z.number(),
  productUrl: z.string().optional(),
});

const createArtImageSchema = z.object({
  artId: z.number(),
  imageUrl: z.string(),
  createdAt: z.date(),
});

const createDialySchema = z.object({
  userId: z.number(),
  content: z.string().min(1).max(100),
});

const createDeckSchema = z.object({
  userId: z.number(),
  code: z.string().min(1).max(100),
});

const createDeckHistorySchema = z.object({
  deckId: z.number(),
  status: z.string().min(1).max(100),
  content: z.string().optional(),
});

const createDeckImageSchema = z.object({
  deckId: z.number(),
  imageUrl: z.string(),
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

export async function getArtImagesBy(artId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  return await db
    .select()
    .from(artImages)
    .where(eq(artImages.artId, artId))
    .all();
}

export async function createArt(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();

  const formObject = {
    userId: Number(formData.get("userId")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    price: Number(formData.get("price")),
    productUrl: formData.get("productUrl") as string,
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
    price: Number(formData.get("price")),
    productUrl: formData.get("productUrl") as string,
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
    price: result.data.price,
    productUrl: result.data.productUrl || "",
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

  // まず、artIdに紐づくartImagesテーブルのレコードを削除
  const deleteImagesResponse = await db
    .delete(artImages)
    .where(eq(artImages.artId, artId))
    .execute();

  // artImagesの削除が成功したら、artsテーブルのレコードを削除
  if (deleteImagesResponse.success) {
    const deleteArtResponse = await db
      .delete(arts)
      .where(eq(arts.id, artId))
      .execute();

    if (deleteArtResponse.success) {
      return json(
        { message: "作品と関連画像が削除されました", success: true },
        { status: 200 }
      );
    } else {
      return json(
        { message: "作品の削除に失敗しました", success: false },
        { status: 500 }
      );
    }
  } else {
    return json(
      { message: "関連画像の削除に失敗しました", success: false },
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

// comaji の API を使って画像をアップロード
export async function uploadArtImage(
  formData: FormData,
  context: AppLoadContext
): Promise<UploadResponse> {
  const env = context.env as Env;
  const apiEndpoint = env.C_API_BASE_URL;
  const authKey = env.C_AUTH_KEY;
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

export async function createDialy(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();

  const formObject = {
    userId: Number(formData.get("userId")),
    content: formData.get("content") as string,
  };
  const result = createDialySchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const newDialy: CreateDialy = {
    ...result.data,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  const response = await db.insert(dialies).values(newDialy).execute();
  if (response.success) {
    return json({ message: "日記を投稿しました" }, { status: 201 });
  } else {
    return json({ message: "日記の投稿に失敗しました" }, { status: 500 });
  }
}

export async function getDialies(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  return await db
    .select()
    .from(dialies)
    .orderBy(desc(dialies.updatedAt), desc(dialies.createdAt))
    .all();
}

export async function getDialyBy(dialyId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  return await db.select().from(dialies).where(eq(dialies.id, dialyId)).get();
}

export async function deleteDialy(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const dialyId = Number(formData.get("dialyId"));
  const response = await db
    .delete(dialies)
    .where(eq(dialies.id, dialyId))
    .execute();

  if (response.success) {
    return json(
      { message: "日記が削除されました", success: true },
      { status: 200 }
    );
  }
  return json(
    { message: "日記の削除に失敗しました", success: false },
    { status: 500 }
  );
}

// createDeck は decks と deckHistories, deckImages テーブルにデータを挿入する
// まず、decks テーブルにデータを挿入し、その後、deckHistories テーブルにデータを挿入する。これは createDeckHistory で行い、別関数にする
// formData には userId, code が含まれる
// 受け取った code を使用して、https://pokemon-card-deck-scraper-ghyv6dyl6a-an.a.run.app/fetchDeck にリクエストを送る
// そのレスポンスで imageUrl を取得し、deckImages テーブルにデータを挿入する。これは createDeckImage で行い、別関数にする
export async function createDeck(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();

  const formObject = {
    userId: Number(formData.get("userId")),
    code: formData.get("code") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };
  const result = createDeckSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  // デッキコードを使用して、デッキの画像を取得
  const deckImageUrlResponse = await fetch(
    "https://pokemon-card-deck-scraper-ghyv6dyl6a-an.a.run.app/fetchDeck",
    {
      method: "POST",
      body: JSON.stringify({ deckCode: result.data.code }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!deckImageUrlResponse.ok) {
    return json({ message: "デッキ画像の取得に失敗しました" }, { status: 500 });
  }

  const deckImageUrlJson =
    (await deckImageUrlResponse.json()) as UploadResponse;
  const imageUrl = deckImageUrlJson.url;

  const newDeck: CreateDeck = {
    ...result.data,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  const response = await db.insert(decks).values(newDeck).execute();
  if (!response.success) {
    return json({ message: "デッキの登録に失敗しました" }, { status: 500 });
  }

  // 直前にインサートされたレコードを取得
  const insertedRecord = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, newDeck.userId))
    .orderBy(desc(decks.createdAt))
    .limit(1)
    .execute();
  const newDeckId = insertedRecord[0].id;

  // デッキの画像を登録
  const createDeckImageResponse = await createDeckImage(
    newDeckId,
    imageUrl,
    db
  );
  if (createDeckImageResponse.status !== 201) {
    return json(
      { message: "デッキの画像の登録に失敗しました" },
      { status: 500 }
    );
  }

  // デッキの履歴を登録
  const createDeckHistoryResponse = await createDeckHistory(newDeckId, db);
  if (createDeckHistoryResponse.status !== 201) {
    return json(
      { message: "デッキの履歴の登録に失敗しました" },
      { status: 500 }
    );
  }

  return json(
    { message: "デッキを投稿しました", id: newDeckId },
    { status: 201 }
  );
}

export async function createDeckHistory(
  deckId: number,
  db: DrizzleD1Database<Record<string, never>>
) {
  const currentTime = new Date();

  const formObject = {
    deckId: deckId,
    status: "main",
    content: "内容は空です",
  };
  const result = createDeckHistorySchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const newDeckHistory: CreateDeckHistory = {
    ...result.data,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  const response = await db
    .insert(deckHistories)
    .values(newDeckHistory)
    .execute();
  if (response.success) {
    return json({ message: "デッキの履歴を登録しました" }, { status: 201 });
  } else {
    return json(
      { message: "デッキの履歴の登録に失敗しました" },
      { status: 500 }
    );
  }
}

export async function createDeckImage(
  deckId: number,
  imageUrl: string,
  db: DrizzleD1Database<Record<string, never>>
) {
  const currentTime = new Date();

  const formObject = {
    deckId: deckId,
    imageUrl: imageUrl,
  };
  const result = createDeckImageSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const newDeckImage: CreateDeckImage = {
    ...result.data,
    createdAt: currentTime,
  };

  const response = await db.insert(deckImages).values(newDeckImage).execute();
  if (response.success) {
    return json({ message: "デッキの画像を登録しました" }, { status: 201 });
  }
  return json({ message: "デッキの画像の登録に失敗しました" }, { status: 500 });
}

export async function getDecksBy(userId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const decksData = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.updatedAt), desc(decks.createdAt))
    .all();

  const decksWithDetails = await Promise.all(
    decksData.map(async (deck) => {
      const images = await db
        .select()
        .from(deckImages)
        .where(eq(deckImages.deckId, deck.id))
        .all();

      const histories = await db
        .select()
        .from(deckHistories)
        .where(eq(deckHistories.deckId, deck.id))
        .all();

      return {
        ...deck,
        images,
        histories,
      };
    })
  );

  return decksWithDetails;
}
