import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import {
  getDeckHistoryById,
  deleteDeckHistory,
  getDeck,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

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

  return json({ deckUser });
}

export const action = async ({ params, context }: LoaderFunctionArgs) => {
  const { historyId, deckId, userId } = params;

  const response = await deleteDeckHistory(Number(historyId), context);

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

export default function DeleteDeckHistory() {
  const { deckUser } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(deckUser.uid, false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        デッキ履歴を削除する
      </h2>
      <p className="text-error text-center mb-4">
        この操作は取り消せません。本当に削除しますか？
        <br />
        デッキ履歴に関連するデータは全て削除されます。
      </p>
      <Form method="post" className="space-y-4">
        <div>
          <button
            type="submit"
            className="btn btn-error w-full max-w-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "削除中..." : "削除"}
          </button>
        </div>
        <Link to="../" className="btn mt-4" preventScrollReset>
          戻る
        </Link>
      </Form>
    </div>
  );
}
