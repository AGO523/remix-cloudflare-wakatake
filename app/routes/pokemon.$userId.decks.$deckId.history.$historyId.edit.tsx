import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  updateDeckHistory,
  getDeckCodeByHistoryId,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import DeckHistoryForm from "~/features/common/components/DeckHistoryForm";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { historyId, userId } = params;

  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);

  return json({ deckHistory, user, deckCode });
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
  const { deckHistory, deckCode } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        デッキ履歴を編集する
      </h2>
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
          className="btn btn-secondary w-1/2 mr-1"
          preventScrollReset
        >
          画像を表示
        </Link>
        <Link
          to={`upload`}
          className="btn btn-secondary w-1/2 ml-1"
          preventScrollReset
        >
          画像をアップロード
        </Link>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
