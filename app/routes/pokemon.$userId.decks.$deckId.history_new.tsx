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
        <Form method="post" className="space-y-4">
          <input type="hidden" name="deckId" value={deck.id} />
          <input type="hidden" name="userId" value={user.id} />
          <div>
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
            <textarea
              name="content"
              id="content"
              placeholder="内容"
              className="textarea textarea-bordered w-full min-h-[300px]"
            ></textarea>
          </div>

          {/* 履歴にデッキコードを挿入 */}

          <div className="divider">デッキ画像挿入</div>

          <div className="mt-4 mb-4">
            <input
              type="text"
              name="code"
              id="code"
              placeholder="デッキコードを入力(任意)"
              className="input input-bordered w-full"
            />
            <p className="text-gray-600 text-sm">
              この履歴にデッキ画像を表示することができます
            </p>

            <input
              type="checkbox"
              name="first"
              id="first"
              className="checkbox checkbox-secondary border-4 mt-2"
            />
            <p className="text-gray-600 text-sm pb-2">
              ↑のデッキコードをメインのデッキ画像に設定する（後から変更可）
            </p>
          </div>

          {/* 履歴に画像を挿入 */}

          <div className="divider">その他の画像挿入</div>

          <div>
            <input
              type="text"
              name="cardImageUrl"
              id="cardImageUrl"
              placeholder="挿入する画像のURLを貼り付ける(任意)"
              className="input input-bordered w-full"
            />
            <p className="text-gray-600 text-sm">
              デッキ画像とは別に、この履歴に1枚まで画像を添付できます
              <br />
              「画像を表示」ボタンから、画像を選んでURLをコピーできます
              <br />
              「画像をアップロード」ボタンから、新しい画像をアップロードできます
            </p>
          </div>

          <div className="divider"></div>

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
