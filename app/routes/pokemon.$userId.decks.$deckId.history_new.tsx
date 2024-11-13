import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Link,
  Outlet,
  json,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  getDeckById,
  createDeckHistory,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import DeckHistoryForm from "~/features/common/components/DeckHistoryForm";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { deckId } = params;
  const deck = await getDeckById(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }

  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }
  return json({ deck, deckUser });
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
  const { deck, deckUser } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { loading } = useAuthGuard(deckUser.uid, false);

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="p-4 bg-base-300 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキ履歴を作成する
        </h2>
        <DeckHistoryForm
          method="post"
          action=""
          isSubmitting={isSubmitting}
          defaultValues={{
            deckId: deck.id,
            userId: deckUser.id,
          }}
        />
        <div className="divider">画像取得・アップロード</div>
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
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
