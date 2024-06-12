import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  updateDeckHistory,
  getDeckCodeByHistoryId,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { historyId } = params;
  if (!historyId) {
    throw new Response("History ID is required", { status: 400 });
  }

  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);

  return json({ deckHistory, user, deckCode });
}

export const action = async ({
  params,
  context,
  request,
}: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const { historyId } = params;

  const response = await updateDeckHistory(
    Number(historyId),
    formData,
    context
  );

  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${params.userId}/decks/${params.deckId}/history/${historyId}`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${params.userId}/decks/${params.deckId}/history/${historyId}`,
    responseData.message
  );
};

export default function EditDeckHistory() {
  const { deckHistory, deckCode } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        デッキ履歴を編集する
      </h2>
      <Form method="post" className="space-y-4">
        <div>
          <select
            name="status"
            defaultValue={deckHistory.status}
            className="input input-bordered w-full"
          >
            <option value="main">公開</option>
            <option value="sub">非公開</option>
            <option value="draft">下書き</option>
          </select>
        </div>
        <div>
          <textarea
            name="content"
            placeholder="内容"
            defaultValue={deckHistory.content ?? ""}
            className="textarea textarea-bordered w-full min-h-[300px]"
          ></textarea>
        </div>
        {deckCode && deckCode.imageUrl && (
          <div>
            <input type="hidden" name="deckId" value={deckCode.deckId} />
            <input type="hidden" name="currentDeckCodeId" value={deckCode.id} />
            <input type="hidden" name="status" value={deckCode.status} />
            <input
              type="text"
              name="code"
              placeholder="デッキコード"
              defaultValue={deckCode.code ?? ""}
              className="input input-bordered w-full"
            />
            <span className="text-gray-700">
              履歴に関連付けられたデッキコードがあります。変更する場合は入力してください。
            </span>
          </div>
        )}
        <div>
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
        </div>
        <Link to="../" className="btn mt-4" preventScrollReset>
          戻る
        </Link>
      </Form>
    </div>
  );
}
