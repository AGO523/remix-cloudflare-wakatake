import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import {
  getDeckById,
  deleteDeck,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
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
  return json({ deckUser });
}

export const action = async ({ params, context }: LoaderFunctionArgs) => {
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  const response = await deleteDeck(Number(deckId), context);
  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${params.userId}/decks`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${params.userId}/decks`,
    responseData.message
  );
};

export default function DeleteDeck() {
  const { deckUser } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(deckUser.uid);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="flex justify-center items-center">
      <div className="shadow-md rounded-lg p-8 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキを削除する
        </h2>
        <p className="text-error text-center mb-4">
          この操作は取り消せません。本当に削除しますか？
          <br />
          デッキに関連するデータは全て削除されます。
        </p>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={deckUser.id} />
          <div>
            <button
              type="submit"
              className="btn btn-error w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "デッキを削除しています..." : "削除"}
            </button>
          </div>
        </Form>
        <Link to="../" className="btn w-full mt-4">
          キャンセル
        </Link>
      </div>
    </div>
  );
}
