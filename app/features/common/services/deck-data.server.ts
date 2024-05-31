/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import { decks, deckHistories, deckImages } from "db/schema";
import { InferInsertModel, eq, desc } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";
import { DrizzleD1Database } from "drizzle-orm/d1";

type CreateDeck = InferInsertModel<typeof decks>;
type CreateDeckHistory = InferInsertModel<typeof deckHistories>;
type CreateDeckImage = InferInsertModel<typeof deckImages>;

interface Env {
  DB: D1Database;
  C_API_BASE_URL: string;
  C_AUTH_KEY: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  url: string;
}

const createDeckSchema = z.object({
  userId: z.number(),
  code: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  description: z.string().optional(),
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

const updateDeckSchema = z.object({
  code: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  description: z.string().optional(),
});

const updateDeckHistorySchema = z.object({
  status: z.string().min(1).max(100),
  content: z.string().optional(),
});

async function fetchDeckImage(code: string): Promise<string | null> {
  const deckImageUrlResponse = await fetch(
    "https://pokemon-card-deck-scraper-ghyv6dyl6a-an.a.run.app/fetchDeck",
    {
      method: "POST",
      body: JSON.stringify({ deckCode: code }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!deckImageUrlResponse.ok) {
    return null;
  }

  const deckImageUrlJson =
    (await deckImageUrlResponse.json()) as UploadResponse;
  return deckImageUrlJson.url;
}

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

  const fetchResult = await fetchDeckImage(result.data.code);
  if (!fetchResult) {
    return json({ message: "デッキ画像の取得に失敗しました" }, { status: 500 });
  }
  const imageUrl = fetchResult;

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
  const createDeckHistoryResponse = await createDeckHistory(
    newDeckId,
    formData,
    context
  );
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
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();

  const formObject = {
    deckId,
    status: (formData.get("status") as string) || "main",
    content: (formData.get("content") as string) || "",
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

export async function getDeckById(deckId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const deck = await db.select().from(decks).where(eq(decks.id, deckId)).get();

  if (!deck) {
    return null;
  }

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

  return { ...deck, images, histories };
}

export async function getDeckHistoryById(
  deckHistoryId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const deckHistory = await db
    .select()
    .from(deckHistories)
    .where(eq(deckHistories.id, deckHistoryId))
    .get();

  return deckHistory;
}

export async function updateDeck(
  deckId: number,
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const formObject = {
    code: formData.get("code") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const result = updateDeckSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const updatedDeck = {
    ...result.data,
    updatedAt: new Date(),
  };

  const response = await db
    .update(decks)
    .set(updatedDeck)
    .where(eq(decks.id, deckId))
    .execute();
  if (response.success) {
    return json({ message: "デッキを更新しました" }, { status: 200 });
  }
  return json({ message: "デッキの更新に失敗しました" }, { status: 500 });
}

export async function deleteDeck(deckId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  try {
    // Delete images
    const deleteImagesResponse = await db
      .delete(deckImages)
      .where(eq(deckImages.deckId, deckId))
      .execute();

    if (!deleteImagesResponse.success) {
      throw new Error("Failed to delete deck images");
    }

    // Delete histories
    const deleteHistoriesResponse = await db
      .delete(deckHistories)
      .where(eq(deckHistories.deckId, deckId))
      .execute();

    if (!deleteHistoriesResponse.success) {
      throw new Error("Failed to delete deck histories");
    }

    // Delete the deck itself
    const deleteDeckResponse = await db
      .delete(decks)
      .where(eq(decks.id, deckId))
      .execute();

    if (!deleteDeckResponse.success) {
      throw new Error("Failed to delete deck");
    }

    return json({ message: "デッキを削除しました" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ message: "デッキの削除に失敗しました" }, { status: 500 });
  }
}

export async function updateDeckHistory(
  deckHistoryId: number,
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const formObject = {
    status: formData.get("status") as string,
    content: formData.get("content") as string,
  };

  const result = updateDeckHistorySchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const updatedDeckHistory = {
    ...result.data,
    updatedAt: new Date(),
  };

  const response = await db
    .update(deckHistories)
    .set(updatedDeckHistory)
    .where(eq(deckHistories.id, deckHistoryId))
    .execute();
  if (response.success) {
    return json({ message: "デッキ履歴を更新しました" }, { status: 200 });
  }
  return json({ message: "デッキ履歴の更新に失敗しました" }, { status: 500 });
}

export async function deleteDeckHistory(
  deckHistoryId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const response = await db
    .delete(deckHistories)
    .where(eq(deckHistories.id, deckHistoryId))
    .execute();
  if (response.success) {
    return json({ message: "デッキ履歴を削除しました" }, { status: 200 });
  }
  return json({ message: "デッキ履歴の削除に失敗しました" }, { status: 500 });
}