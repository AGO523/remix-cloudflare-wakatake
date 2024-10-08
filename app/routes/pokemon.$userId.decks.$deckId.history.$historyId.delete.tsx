import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  deleteDeckHistory,
  getDeck,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { historyId, deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  const deckUserId = deck.userId;

  if (deckUserId !== user.id) {
    return redirectWithError(`/pokemon`, "アクセス権限がありません");
  }

  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  return json({ deckHistory, user });
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
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
