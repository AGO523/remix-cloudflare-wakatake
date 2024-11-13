import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import {
  getDeckHistoryById,
  updateDeckHistory,
  getDeckCodeByHistoryId,
  getDeck,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import DeckHistoryForm from "~/features/common/components/DeckHistoryForm";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { historyId, deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }

  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }

  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);

  return json({ deckHistory, deckUser, deckCode });
}

export const action = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const { historyId } = params;

  const response = await updateDeckHistory(
    Number(historyId),
    formData,
    context
  );

  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${params.userId}/decks/${params.deckId}/history/${historyId}`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${params.userId}/decks/${params.deckId}/history/${historyId}`,
    responseData.message
  );
};

export default function EditDeckHistory() {
  const { deckHistory, deckUser, deckCode } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { loading } = useAuthGuard(deckUser.uid, false);

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-6">デッキ履歴を編集する</h2>
        <DeckHistoryForm
          method="post"
          action=""
          isSubmitting={isSubmitting}
          defaultValues={{
            deckId: deckHistory.deckId,
            status: deckHistory.status,
            content: deckHistory.content ?? "",
            code: deckCode?.code ?? "",
            cardImageUrl: deckHistory.cardImageUrl ?? "",
          }}
        />
        <div className="flex justify-between mt-4">
          <Link
            to={`images`}
            className="btn btn-info w-1/2 mr-1"
            preventScrollReset
          >
            画像を表示
          </Link>
          <Link
            to={`upload`}
            className="btn btn-info w-1/2 ml-1"
            preventScrollReset
          >
            画像をアップロード
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </>
  );
}
