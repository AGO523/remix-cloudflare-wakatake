import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import {
  getDeck,
  getDeckById,
  getUserBy,
  updateDeck,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { deckId } = params;
  const currentDeck = await getDeck(Number(deckId), context);
  if (!currentDeck) {
    throw new Response("Deck not found", { status: 404 });
  }
  const deckUserId = currentDeck.userId;
  const user = await getUserBy(Number(deckUserId), context);
  if (!user || !user.uid) {
    console.error("User not found, uid is null");
    return redirectWithError(`/pokemon`, "アクセス権限がありません");
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
  const userId = formData.get("userId");
  const response = await updateDeck(Number(deckId), formData, context);

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

export default function EditDeck() {
  const { deck, user } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(user.uid);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="p-4 bg-base-100 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキを編集する
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <span className="text-base-content">デッキ名</span>
            <input
              type="text"
              name="title"
              placeholder="デッキ名"
              defaultValue={deck.title || ""}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <span className="text-base-content">デッキの説明</span>
            <textarea
              name="description"
              placeholder="デッキの説明"
              defaultValue={deck.description || ""}
              className="textarea textarea-bordered w-full min-h-[200px]"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-info p-4 w-1/3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "デッキを更新しています..." : "更新"}
            </button>
          </div>
          <Link to="../" className="btn btn-error mt-4">
            キャンセル
          </Link>
        </Form>
      </div>
    </div>
  );
}
