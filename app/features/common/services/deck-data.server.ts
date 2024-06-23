/////////////////////////////////////////////////////////////
// このファイルはデータベースと接続してデータ操作を行う処理を記述する //
/////////////////////////////////////////////////////////////
import type { AppLoadContext } from "@remix-run/cloudflare";
import { decks, deckHistories, cardImages, deckCodes } from "db/schema";
import { InferInsertModel, eq, desc, sql } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";
import { json } from "@remix-run/cloudflare";
import { z } from "zod";

type CreateDeck = InferInsertModel<typeof decks>;
type CreateDeckHistory = InferInsertModel<typeof deckHistories>;
type createCardImage = InferInsertModel<typeof cardImages>;
type createDeckCode = InferInsertModel<typeof deckCodes>;

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
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  code: z.string().min(1).max(100),
});

const createDeckHistorySchema = z.object({
  deckId: z.number(),
  status: z.string().min(1).max(100),
  content: z.string().optional(),
  cardImageUrl: z.string().optional(),
});

const createCardImageSchema = z.object({
  userId: z.number(),
  imageUrl: z.string(),
  createdAt: z.date(),
});

const createDeckCodeSchema = z.object({
  deckId: z.number(),
  historyId: z.number().optional(),
  status: z.string().min(1).max(100),
  code: z.string().min(1).max(100),
  imageUrl: z.string().optional(),
});

const updateDeckSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
});

const updateDeckHistorySchema = z.object({
  status: z.string().min(1).max(100),
  content: z.string().optional(),
  cardImageUrl: z.string().optional(),
});

const updateDeckCodeSchema = z.object({
  deckId: z.number(),
  status: z.string().min(1).max(100),
  code: z.string().min(1).max(100),
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

// デッキコードを受け取り外部 API にリクエストを送信
// URLが返却される
// decks にレコードを作成
// deckHistories にレコードを作成
// deckCodes にレコードを作成
export async function createDeck(formData: FormData, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();

  const formObject = {
    userId: Number(formData.get("userId")),
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    code: formData.get("code") as string,
  };
  const result = createDeckSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

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

  // formData に first: true を追加
  formData.append("first", "true");

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

/////////////////////////////////////////////////
//////////////////// コア関数 ////////////////////
/////////////////////////////////////////////////
export async function createDeckHistory(
  deckId: number,
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();
  const isDeckCode = formData.get("code") ? true : false;

  const formObject = {
    deckId,
    status: (formData.get("status") as string) || "main",
    content: (formData.get("content") as string) || "内容は空です",
    cardImageUrl: (formData.get("cardImageUrl") as string) || "",
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
  if (!response.success) {
    return json({ message: "デッキ履歴の登録に失敗しました" }, { status: 500 });
  }

  if (isDeckCode) {
    const isFirst =
      formData.get("first") === "on" ||
      formData.get("first") === "true" ||
      false;
    // 直前にインサートされたレコードを取得
    const insertedRecord = await db
      .select()
      .from(deckHistories)
      .where(eq(deckHistories.deckId, deckId))
      .orderBy(desc(deckHistories.createdAt))
      .limit(1)
      .execute();

    // デッキコードを登録
    const createDeckCodeResponse = await createDeckCode(
      deckId,
      insertedRecord[0].id,
      formData.get("code") as string,
      isFirst,
      context
    );

    if (createDeckCodeResponse.status !== 201) {
      return json(
        { message: "デッキコードの登録に失敗しました" },
        { status: 500 }
      );
    }

    // first が true の場合 deckCodes を main にして、他のデッキコードを sub にする
    if (isFirst) {
      const updateDeckCodeResponse = await updateDeckCoeToMain(
        deckId,
        insertedRecord[0].id,
        context
      );

      if (updateDeckCodeResponse.status !== 200) {
        return json(
          { message: "デッキコードのステータスの更新に失敗しました" },
          { status: 500 }
        );
      }
    }
  }

  return json({ message: "デッキ履歴を登録しました" }, { status: 201 });
}

// code を受け取り、fetchDeckImage で画像を取得
// status が main にするか sub にするかパラメーター(first)で判定
export async function createDeckCode(
  deckId: number,
  historyId: number,
  code: string,
  first: boolean,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const currentTime = new Date();
  const codeStatus = first ? "main" : "sub";

  const fetchResult = await fetchDeckImage(code);
  if (!fetchResult) {
    return json({ message: "デッキ画像の取得に失敗しました" }, { status: 500 });
  }
  const imageUrl = fetchResult;

  const formObject = {
    deckId,
    historyId,
    status: codeStatus,
    code,
    imageUrl,
  };

  const result = createDeckCodeSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  const newDeckCode = {
    ...result.data,
    createdAt: currentTime,
  };

  const response = await db.insert(deckCodes).values(newDeckCode).execute();
  if (response.success) {
    return json({ message: "デッキコードを登録しました" }, { status: 201 });
  }
  return json({ message: "デッキコードの登録に失敗しました" }, { status: 500 });
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
      const histories = await db
        .select()
        .from(deckHistories)
        .where(eq(deckHistories.deckId, deck.id))
        .all();

      const codes = await db
        .select()
        .from(deckCodes)
        .where(eq(deckCodes.deckId, deck.id))
        .all();

      return { ...deck, histories, codes };
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

  const histories = await db
    .select()
    .from(deckHistories)
    .where(eq(deckHistories.deckId, deck.id))
    .all();

  const codes = await db
    .select()
    .from(deckCodes)
    .where(eq(deckCodes.deckId, deck.id))
    .all();

  return { ...deck, histories, codes };
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
    const deleteCodesResponse = await db
      .delete(deckCodes)
      .where(eq(deckCodes.deckId, deckId))
      .execute();

    if (!deleteCodesResponse.success) {
      throw new Error("Failed to delete deck images");
    }

    const deleteHistoriesResponse = await db
      .delete(deckHistories)
      .where(eq(deckHistories.deckId, deckId))
      .execute();

    if (!deleteHistoriesResponse.success) {
      throw new Error("Failed to delete deck histories");
    }

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
  const isDeckCode = formData.get("code") ? true : false;
  const isNewDeckCode = formData.get("newCode") ? true : false;

  const formObject = {
    status: formData.get("status") as string,
    content: formData.get("content") as string,
    cardImageUrl: (formData.get("cardImageUrl") as string) || "",
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
  if (!response.success) {
    return json({ message: "デッキ履歴の更新に失敗しました" }, { status: 500 });
  }

  if (isDeckCode) {
    const currentDeckCodeId = formData.get("currentDeckCodeId");
    const updateDeckCodeResponse = await updateDeckCode(
      Number(currentDeckCodeId),
      Number(deckHistoryId),
      formData,
      context
    );
    if (updateDeckCodeResponse.status !== 200) {
      return json(
        { message: "デッキコードの更新に失敗しました" },
        { status: 500 }
      );
    }
  }

  if (isNewDeckCode) {
    const first =
      formData.get("first") === "on" ||
      formData.get("first") === "true" ||
      false;

    const createDeckCodeResponse = await createDeckCode(
      Number(formData.get("deckId")),
      Number(deckHistoryId),
      formData.get("newCode") as string,
      first,
      context
    );
    if (createDeckCodeResponse.status !== 201) {
      return json(
        { message: "デッキコードの登録に失敗しました" },
        { status: 500 }
      );
    }
  }

  return json({ message: "デッキ履歴を更新しました" }, { status: 200 });
}

export async function updateDeckCode(
  deckCodeId: number,
  historyId: number,
  formData: FormData,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);
  const code = formData.get("code") as string;
  const isMain =
    formData.get("first") === "on" || formData.get("first") === "true" || false;

  const formObject = {
    deckId: Number(formData.get("deckId")),
    status: isMain ? "main" : "sub",
    code: formData.get("code") as string,
  };

  const result = updateDeckCodeSchema.safeParse(formObject);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  // 現在のデッキコードを取得
  // formDataの code が異なる場合、新しいデッキコードを取得
  // 同じ場合は imageUrl に現在のデッキコードの imageUrl をセット
  const currentDeckCode = await db
    .select()
    .from(deckCodes)
    .where(eq(deckCodes.id, deckCodeId))
    .get();

  if (!currentDeckCode) {
    return json({ message: "デッキコードが見つかりません" }, { status: 404 });
  }

  const isNewCode = code !== currentDeckCode.code;
  const imageUrl = isNewCode
    ? await fetchDeckImage(code)
    : currentDeckCode.imageUrl;
  if (!imageUrl) {
    return json({ message: "デッキ画像の取得に失敗しました" }, { status: 500 });
  }

  const updatedDeckCode = {
    ...result.data,
    historyId,
    imageUrl,
  };

  const response = await db
    .update(deckCodes)
    .set(updatedDeckCode)
    .where(eq(deckCodes.id, deckCodeId))
    .execute();
  if (response.success) {
    return json({ message: "デッキコードを更新しました" }, { status: 200 });
  }

  return json({ message: "デッキコードの更新に失敗しました" }, { status: 500 });
}

export async function deleteDeckHistory(
  deckHistoryId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  try {
    const deleteCodesResponse = await db
      .delete(deckCodes)
      .where(eq(deckCodes.historyId, deckHistoryId))
      .execute();

    if (!deleteCodesResponse.success) {
      throw new Error("Failed to delete deck images");
    }

    const response = await db
      .delete(deckHistories)
      .where(eq(deckHistories.id, deckHistoryId))
      .execute();

    if (!response.success) {
      throw new Error("Failed to delete deck histories");
    }

    return json({ message: "デッキを削除しました" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ message: "デッキの削除に失敗しました" }, { status: 500 });
  }
}

export async function uploadAndCreateCardImage(
  formData: FormData,
  context: AppLoadContext
) {
  // 画像をGCSにアップロード
  const uploadResponse = await uploadCardImage(formData, context);
  if (!uploadResponse.success) {
    return json({
      message: uploadResponse.message,
      status: 500,
    });
  }

  const newFormData = {
    userId: Number(formData.get("userId")),
    imageUrl: uploadResponse.url,
    createdAt: new Date(),
  };

  const result = createCardImageSchema.safeParse(newFormData);
  if (!result.success) {
    return json(
      { message: result.error.errors[0].message, errors: result.error },
      { status: 400 }
    );
  }

  // 画像のURLをDBに保存
  const env = context.env as Env;
  const db = createClient(env.DB);
  const newCardImage: createCardImage = result.data;
  const response = await db.insert(cardImages).values(newCardImage).execute();

  if (response.success) {
    return json({ message: "画像を追加しました", status: 201 });
  }
  return json({ message: "画像の追加に失敗しました", status: 500 });
}

// comaji の API を使って画像をアップロード
export async function uploadCardImage(
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

export async function getCardImagesBy(userId: number, context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const cardImagesData = await db
    .select()
    .from(cardImages)
    .where(eq(cardImages.userId, userId))
    .orderBy(desc(cardImages.createdAt))
    .all();

  return cardImagesData;
}

export async function getDeckCodeByDeckId(
  deckId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const deckCode = await db
    .select()
    .from(deckCodes)
    .where(eq(deckCodes.deckId, deckId))
    .get();

  return deckCode;
}

export async function getDeckCodesByDeckId(
  deckId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const deckCodesData = await db
    .select()
    .from(deckCodes)
    .where(eq(deckCodes.deckId, deckId))
    .all();

  return deckCodesData;
}

export async function getDeckCodeByHistoryId(
  historyId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const deckCode = await db
    .select()
    .from(deckCodes)
    .where(eq(deckCodes.historyId, historyId))
    .get();

  return deckCode;
}

export async function updateDeckCoeToMain(
  deckId: number,
  historyId: number,
  context: AppLoadContext
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  // 一度全てのdeckIdに紐づくデッキコードのステータスを sub に戻す
  const resetResponse = await db
    .update(deckCodes)
    .set({ status: "sub" })
    .where(eq(deckCodes.deckId, deckId))
    .execute();

  if (!resetResponse.success) {
    return json(
      { message: "デッキコードのステータスのリセットに失敗しました" },
      500
    );
  }

  // 指定したデッキコードを main にする
  const response = await db
    .update(deckCodes)
    .set({ status: "main" })
    .where(eq(deckCodes.historyId, historyId))
    .execute();

  if (!response.success) {
    return json(
      { message: "デッキコードのステータスの更新に失敗しました" },
      500
    );
  }
  return json({ message: "デッキコードのステータスを更新しました" }, 200);
}

// 全てのデッキコードを取得
export async function getDecks(
  context: AppLoadContext,
  page: number,
  limit: number
) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const decksData = await db
    .select()
    .from(decks)
    .orderBy(desc(decks.createdAt))
    .limit(limit)
    .offset((page - 1) * limit)
    .all();

  if (!decksData) {
    return null;
  }

  // deckCodesのstatusがmain のものを取得
  const decksWithCodes = await Promise.all(
    decksData.map(async (deck) => {
      const codes = await db
        .select()
        .from(deckCodes)
        .where(eq(deckCodes.deckId, deck.id))
        .all();

      return { ...deck, codes };
    })
  );

  return decksWithCodes;
}

export async function getDeckCount(context: AppLoadContext) {
  const env = context.env as Env;
  const db = createClient(env.DB);

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(decks)
    .all();

  return countResult.length > 0 ? Number(countResult[0].count) : 0;
}
