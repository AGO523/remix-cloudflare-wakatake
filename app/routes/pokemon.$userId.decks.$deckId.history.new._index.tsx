import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckById,
  createDeckHistory,
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
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  const response = await createDeckHistory(Number(deckId), formData, context);
  if (response && response.status === 201) {
    return redirect(`/pokemon/${params.userId}/decks/${deckId}`);
  }
  return json({ message: "デッキ履歴の作成に失敗しました" }, { status: 500 });
};

export default function NewDeckHistory() {
  const { deck, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="bg-base-200 shadow-md rounded-lg p-8 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          デッキ履歴を作成する
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="deckId" value={deck.id} />
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label htmlFor="status" className="block mb-2">
              ステータス
            </label>
            <select
              name="status"
              id="status"
              className="select select-bordered w-full"
              required
            >
              <option value="main">公開</option>
              <option value="sub">非公開</option>
              <option value="draft">下書き</option>
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block mb-2">
              内容
            </label>
            <textarea
              name="content"
              id="content"
              placeholder="内容"
              className="textarea textarea-bordered w-full min-h-[400px]"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "デッキ履歴を作成しています..." : "作成"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
