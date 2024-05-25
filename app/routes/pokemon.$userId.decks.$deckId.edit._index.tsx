import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useNavigation,
  useNavigate,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckById,
  updateDeck,
} from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
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
  const response = await updateDeck(Number(deckId), formData, context);
  if (response && response.status === 200) {
    return redirect(`/pokemon/${formData.get("userId")}/decks/${deckId}`);
  }
  return json({ message: "デッキの更新に失敗しました" }, { status: 500 });
};

export default function EditDeck() {
  const { deck, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="bg-base-200 shadow-md max-w-3xl rounded-lg p-8 w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキを編集する
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <span className="text-gray-700">デッキコード</span>
            <input
              type="text"
              name="code"
              placeholder="デッキコード"
              defaultValue={deck.code || ""}
              className="input input-bordered w-full"
              required
            />
          </div>
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
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "デッキを更新しています..." : "更新"}
            </button>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-error btn-sm w-full"
              onClick={() => navigate(-1)}
            >
              キャンセル
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
