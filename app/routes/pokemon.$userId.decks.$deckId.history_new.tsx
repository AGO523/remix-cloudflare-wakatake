import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
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
            <label htmlFor="content" className="block mb-2">
              デッキコード
            </label>
            <input
              type="text"
              name="code"
              id="code"
              placeholder="デッキコード"
              className="input input-bordered w-full"
            />
            <p className="text-gray-600 text-sm">
              履歴にデッキ画像を表示する場合は、デッキコードを入力してください。
            </p>
            <input
              type="checkbox"
              name="first"
              id="first"
              className="checkbox checkbox-primary mt-2"
            />
            <p className="text-gray-600 text-sm">
              デッキのメイン画像にする場合はチェックを入れてください。
            </p>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "デッキ履歴を作成しています..." : "作成"}
            </button>
            <p className="text-error text-sm">
              デッキコードを入力している場合は、作成に時間がかかることがあります。10秒から30秒程度お待ちください。
            </p>
          </div>
        </Form>
        <div className="flex justify-between mt-4">
          <Link
            to={`images`}
            className="btn btn-primary w-1/2 mr-1"
            preventScrollReset
          >
            画像を表示
          </Link>
          <Link
            to={`upload`}
            className="btn btn-primary w-1/2 ml-1"
            preventScrollReset
          >
            画像をアップロード
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
