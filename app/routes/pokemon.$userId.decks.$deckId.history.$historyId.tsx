import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckHistoryById } from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  console.log(params);
  if (params === undefined || params === null) {
    throw new Response("Params is required", { status: 400 });
  }
  const deckHistoryId = Number(params.historyId);
  const deckHistory = await getDeckHistoryById(deckHistoryId, context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }
  return json({ deckHistory });
}

export default function DeckHistoryDetail() {
  const { deckHistory } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-3xl font-bold mb-6">デッキ履歴詳細</h1>
      <p className="text-gray-700 mb-4">{deckHistory.content}</p>
      <p className="text-gray-700 mb-4">ステータス: {deckHistory.status}</p>
      <p className="text-gray-700 mb-4">
        作成日時: {new Date(deckHistory.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
