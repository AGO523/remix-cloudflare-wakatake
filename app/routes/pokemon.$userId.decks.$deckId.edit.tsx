import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckById,
  updateDeck,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

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
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-4 bg-base-100 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキを編集する
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <span className="text-gray-700">デッキ名</span>
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
            <span className="text-gray-700">デッキの説明</span>
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
