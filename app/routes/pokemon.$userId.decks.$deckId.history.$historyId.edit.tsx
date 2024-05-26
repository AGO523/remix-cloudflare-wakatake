import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  updateDeckHistory,
} from "~/features/common/services/deck-data.server";

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

  return json({ deckHistory, user });
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
  if (response.status === 200) {
    return redirect(
      `/pokemon/${params.userId}/decks/${params.deckId}/history/${historyId}`
    );
  }
  return response;
};

export default function EditDeckHistory() {
  const { deckHistory } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto p-4">
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
            className="textarea textarea-bordered w-full min-h-[400px]"
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
        </div>
      </Form>
    </div>
  );
}
