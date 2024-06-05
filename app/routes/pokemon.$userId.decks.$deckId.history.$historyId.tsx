import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  getDeckCodeByHistoryId,
} from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (params === undefined || params === null) {
    throw new Response("Params is required", { status: 400 });
  }

  const { historyId } = params;
  // デッキコードがある場合にはデッキコードを取得
  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  return json({ deckHistory, deckCode, user });
}

export default function DeckHistoryDetail() {
  const { deckHistory, deckCode, user } = useLoaderData<typeof loader>();
  const currentUserId = user.id;

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6">デッキ履歴詳細</h1>
      <p className="text-gray-700 mb-4">
        {deckHistory.content?.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <p className="text-gray-700 mb-4">
        {deckHistory.status === "main" && "公開"}
        {deckHistory.status === "sub" && "非公開"}
        {deckHistory.status === "draft" && "下書き"}
      </p>
      <p className="text-gray-700 mb-4">
        作成日時:{" "}
        {deckHistory.createdAt
          ? new Date(deckHistory.createdAt).toLocaleString()
          : ""}
      </p>
      {deckCode && deckCode.imageUrl && deckCode.status === "sub" && (
        <img
          src={deckCode.imageUrl}
          alt="デッキの画像"
          className="object-cover rounded-md mb-4"
        />
      )}
      {currentUserId && (
        <>
          <Link to="edit" className="btn btn-primary mt-4" preventScrollReset>
            編集
          </Link>
          <Link to="delete" className="btn btn-error mt-4" preventScrollReset>
            削除
          </Link>
          <Link to="../" className="btn mt-4" preventScrollReset>
            戻る
          </Link>
        </>
      )}

      <Outlet />
    </div>
  );
}
