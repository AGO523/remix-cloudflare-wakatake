import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckHistoryById } from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  if (params === undefined || params === null) {
    throw new Response("Params is required", { status: 400 });
  }

  const { historyId } = params;
  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  return json({ deckHistory, user });
}

export default function DeckHistoryDetail() {
  const { deckHistory, user } = useLoaderData<typeof loader>();
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
      <p className="text-gray-700 mb-4">ステータス: {deckHistory.status}</p>
      <p className="text-gray-700 mb-4">
        作成日時: {new Date(deckHistory.createdAt).toLocaleString()}
      </p>
      {currentUserId && (
        <>
          <Link to="edit" className="btn btn-primary mt-4">
            編集
          </Link>
          <Link to="delete" className="btn btn-error mt-4">
            削除
          </Link>
          <Link to="../" className="btn mt-4">
            戻る
          </Link>
        </>
      )}
    </div>
  );
}
