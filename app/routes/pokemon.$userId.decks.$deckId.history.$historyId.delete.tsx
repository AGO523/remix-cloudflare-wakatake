import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  deleteDeckHistory,
} from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { historyId } = params;
  if (!historyId) {
    throw new Response("History ID is required", { status: 400 });
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
  if (response.status === 200) {
    return redirect(`/pokemon/${userId}/decks/${deckId}`);
  }
  return response;
};

export default function DeleteDeckHistory() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
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
              className="btn btn-error w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "削除中..." : "削除"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
