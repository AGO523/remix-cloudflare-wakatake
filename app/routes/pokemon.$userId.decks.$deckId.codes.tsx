import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import {
  getDeck,
  getDeckCodesByDeckId,
  getUserBy,
  updateDeckCoeToMain,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import { DeckBadge } from "~/features/common/components/DeckBadge";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }

  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }

  const deckCodes = await getDeckCodesByDeckId(Number(deckId), context);
  if (!deckCodes) {
    throw new Response("Deck Codes not found", { status: 404 });
  }
  return json({ deckCodes, deckId, deckUser });
}

export const action = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = params.userId;
  const deckId = Number(params.deckId);
  const deckHistoryId = Number(formData.get("deckHistoryId"));

  const response = await updateDeckCoeToMain(deckId, deckHistoryId, context);
  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${userId}/decks/${deckId}`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${userId}/decks/${deckId}`,
    responseData.message
  );
};

export default function DeckHistoryDetail() {
  const { deckCodes, deckId, deckUser } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(deckUser.uid);

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="p-4 mt-4 bg-base-100 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h1 className="text-3xl font-bold mb-6">デッキコード</h1>
        <p className="text-base-content">
          デッキID: {deckId} に登録されているデッキコード一覧です
        </p>
        <div className="grid grid-cols-1 gap-4">
          {deckCodes.map((deckCode) => (
            <div key={deckCode.id} className="shadow-lg rounded-lg p-4">
              <img
                src={deckCode.imageUrl}
                alt={deckCode.code}
                className="object-cover rounded-md mb-4"
              />
              <Form method="post">
                <input
                  type="hidden"
                  name="deckHistoryId"
                  value={deckCode.historyId || ""}
                />
                <p className="text-base-content">
                  デッキコード:{deckCode.code}
                </p>
                <DeckBadge status={deckCode.status} />
                <p className="text-base-content text-sm">
                  このデッキコードをデッキのメイン画像に設定しますか？
                </p>
                <button type="submit" className="btn btn-info btn-sm m-2">
                  メインに設定する
                </button>
              </Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
