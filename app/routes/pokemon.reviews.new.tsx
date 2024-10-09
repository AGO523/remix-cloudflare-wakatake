import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createSingleCard } from "~/features/common/services/review.server";
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from "remix-toast";
import { getCardImagesBy } from "~/features/common/services/deck-data.server";
import CardImages from "~/features/common/components/CardImages";

// type SingleCard = {
//   id: number;
//   imageUrl: string;
//   name: string;
//   type: string;
//   rule?: string;
//   gameType: string;
//   createdAt: number;
// };

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirectWithError("/login", "ログインしてください");
  }

  if (user.id !== 1) {
    return redirectWithError("/", "アクセス権限がありません");
  }

  const cardImages = await getCardImagesBy(user.id, context);

  return json({ user, cardImages });
};

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (userId !== "1") {
    return redirectWithError("/", "アクセス権限がありません");
  }

  const response = await createSingleCard(formData, context);
  const responseData = await response.json();
  if (response.status !== 201) {
    return jsonWithError({}, responseData.message);
  }

  return redirectWithSuccess(`/pokemon/reviews`, responseData.message);
};

export default function SingleCardForm() {
  const { user, cardImages } = useLoaderData<typeof loader>();
  // const navigation = useNavigation();
  // const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Single Card 作成フォーム</h1>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          {/* カードの名前 */}
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium">
              カード名
            </label>
            <input
              type="text"
              id="cardName"
              name="name"
              placeholder="カードの名前を入力"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* カードタイプ */}
          <div>
            <label htmlFor="cardType" className="block text-sm font-medium">
              タイプ
            </label>
            <input
              type="text"
              id="cardType"
              name="type"
              placeholder="カードのタイプを入力"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* カードルール */}
          <div>
            <label htmlFor="cardRule" className="block text-sm font-medium">
              ルール
            </label>
            <textarea
              id="cardRule"
              name="rule"
              placeholder="カードのルールを入力"
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>

          {/* ゲームタイプの選択 */}
          <div>
            <label htmlFor="gameType" className="block text-sm font-medium">
              ゲームタイプ
            </label>
            <select
              id="gameType"
              name="gameType"
              className="select select-bordered w-full"
              required
            >
              <option value="ポケモンカード">ポケモンカード</option>
              <option value="ポケポケ">ポケポケ</option>
            </select>
          </div>

          {/* カードの画像URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium">
              画像URL
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              placeholder="画像のURLを入力 (任意)"
              className="input input-bordered w-full"
            />
          </div>

          {/* 送信ボタン */}
          <div>
            <button type="submit" className="btn btn-primary w-full">
              作成
            </button>
          </div>
        </Form>
      </div>

      <div>
        {/* 管理者は大量の画像をもつことになる */}
        {/* 表示方法を考える */}
        {/* 別ウィンドウで表示するなど */}
        <CardImages cardImages={cardImages} />
      </div>

      <div>
        <Link
          to={`upload`}
          className="btn btn-info w-1/2 ml-1"
          preventScrollReset
        >
          画像をアップロード
        </Link>
      </div>

      <div>
        <Outlet />
      </div>
    </>
  );
}
