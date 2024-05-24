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
  deleteDeck,
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

export const action = async ({ params, context }: LoaderFunctionArgs) => {
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  const response = await deleteDeck(Number(deckId), context);
  if (response && response.status === 200) {
    console.log("Deck deleted successfully");
    return redirect(`/pokemon/${params.userId}/decks`);
  }
  console.error("Failed to delete deck", response);
  return json({ message: "デッキの削除に失敗しました" }, { status: 500 });
};

export default function DeleteDeck() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキを削除する
        </h2>
        <p className="text-error text-center mb-4">
          この操作は取り消せません。本当に削除しますか？
          <br />
          デッキに関連するデータは全て削除されます。
        </p>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
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
        <div>
          <button
            type="button"
            className="btn btn-sm w-full mt-4"
            onClick={() => navigate(-1)}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
