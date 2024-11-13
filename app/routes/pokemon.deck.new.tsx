import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useNavigation } from "@remix-run/react";
import { createDeck } from "~/features/common/services/deck-data.server";
import { jsonWithError, redirectWithSuccess } from "remix-toast";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import { CreateDeckResponse } from "~/features/common/types/createDeckResponse";

// action 関数の修正
export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const response = await createDeck(formData, context);

  if (response instanceof Response) {
    const responseData = (await response.json()) as CreateDeckResponse;
    return jsonWithError({}, responseData.message);
  }

  // 成功時の処理
  // エラーがない場合、CreateDeckResponse型のオブジェクトが返される
  return redirectWithSuccess(
    `/pokemon/${response.userId}/decks`,
    response.message
  );
};

export default function DeckNew() {
  // const { user } = useLoaderData<typeof loader>();
  const { user } = useAuthGuard();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-4 bg-base-200 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h2 className="text-2xl font-semibold">デッキを作成する</h2>
        <Form method="post">
          {/* ここは uid に変更、クエリでuid から id を特定する */}
          <input type="hidden" name="uid" value={user?.uid} />
          <div>
            <input
              type="text"
              placeholder="デッキコード（必須）"
              className="input input-bordered input-lg w-full max-w-lg mt-2"
              name="code"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="デッキ名（必須）"
              className="input input-bordered input-lg w-full max-w-lg mt-2"
              name="title"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="デッキの説明"
              className="textarea textarea-bordered textarea-lg w-full max-w-lg min-h-[200px] mt-2"
              name="description"
            />
          </div>
          <button
            type="submit"
            className="btn btn-info w-full max-w-xs mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "デッキを作成しています..." : "作成"}
          </button>
        </Form>
      </div>
    </div>
  );
}
