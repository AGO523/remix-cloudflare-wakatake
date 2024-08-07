import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Link,
  Outlet,
  json,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckById,
  createDeckHistory,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import DeckHistoryForm from "~/features/common/components/DeckHistoryForm";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { deckId, userId } = params;

  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  const deck = await getDeckById(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  return json({ deck, user });
}

export const action = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  const response = await createDeckHistory(Number(deckId), formData, context);

  const responseData = await response.json();
  if (response.status === 201) {
    return redirectWithSuccess(
      `/pokemon/${formData.get("userId")}/decks/${deckId}`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${formData.get("userId")}/decks/${deckId}`,
    responseData.message
  );
};

export default function NewDeckHistory() {
  const { deck, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキ履歴を作成する
        </h2>
        <DeckHistoryForm
          method="post"
          action=""
          isSubmitting={isSubmitting}
          defaultValues={{
            deckId: deck.id,
            userId: user.id,
          }}
        />
        <div className="divider">画像取得・アップロード</div>
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
    </div>
  );
}
