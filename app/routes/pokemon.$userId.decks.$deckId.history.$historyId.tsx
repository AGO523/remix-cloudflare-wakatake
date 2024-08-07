import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  getDeckCodeByHistoryId,
} from "~/features/common/services/deck-data.server";
import { Badge } from "~/features/common/components/Badge";
import { DeckBadge } from "~/features/common/components/DeckBadge";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  const { historyId } = params;
  const paramsUserId = Number(params.userId);
  // デッキコードがある場合にはデッキコードを取得
  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  return json({ deckHistory, deckCode, user, paramsUserId });
}

export default function DeckHistoryDetail() {
  const { deckHistory, deckCode, user, paramsUserId } =
    useLoaderData<typeof loader>();
  const currentUserId = user?.id;

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6">デッキ履歴詳細</h1>
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-4">
        <Badge status={deckHistory.status} />

        <div className="mb-4 text-sm text-right">
          <p className="text-gray-700 mb-1">
            作成日時:{" "}
            {deckHistory.createdAt
              ? new Date(deckHistory.createdAt).toLocaleString()
              : ""}
          </p>
          <p className="text-gray-700">
            最終更新日時:{" "}
            {deckHistory.updatedAt
              ? new Date(deckHistory.updatedAt).toLocaleString()
              : ""}
          </p>
        </div>

        {deckCode && deckCode.imageUrl && (
          <>
            <div className="divider">デッキ画像</div>
            <div>
              <DeckBadge status={deckCode.status} />
              <img
                src={deckCode.imageUrl}
                alt="デッキの画像"
                className="object-cover rounded-md mb-2 mt-2"
              />
              <p className="text-gray-700 text-sm text-right mb-2">
                デッキコード:{deckCode.code}
              </p>
            </div>
          </>
        )}

        <div className="divider">本文</div>

        <div className="mt-6 mb-6">
          <p className="text-gray-700 text-left">
            {deckHistory.content?.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        {deckHistory.cardImageUrl && (
          <>
            <div className="divider">その他の画像</div>
            <div className="flex justify-center">
              <img
                src={deckHistory.cardImageUrl}
                alt="添付画像"
                className="object-cover rounded-md mb-4 max-w-[450px] max-h-[450px]"
              />
            </div>
          </>
        )}
      </div>

      {currentUserId && currentUserId === paramsUserId && (
        <div className="flex justify-between mt-4">
          <Link
            to="edit"
            className="btn btn-primary w-1/2 mr-1"
            preventScrollReset
          >
            編集
          </Link>
          <Link
            to="delete"
            className="btn btn-error w-1/2 mr-1"
            preventScrollReset
          >
            削除
          </Link>
        </div>
      )}
      <Link to="../" className="btn w-full max-w-xs mt-2" preventScrollReset>
        戻る
      </Link>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
