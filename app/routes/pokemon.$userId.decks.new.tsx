import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createDeck } from "~/features/common/services/deck-data.server";
import {
  jsonWithError,
  redirectWithError,
  redirectWithSuccess,
} from "remix-toast";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { userId } = params;

  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  return { user };
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const response = await createDeck(formData, context);
  const responseData = await response.json();
  if (response.status === 201) {
    return redirectWithSuccess(
      `/pokemon/${userId}/decks`,
      responseData.message
    );
  }
  return jsonWithError({}, responseData.message);
};

export default function DeckNew() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-4 bg-base-200 flex justify-center">
      <div className="w-full max-w-3xl min-w-0 px-2">
        <h2 className="text-2xl font-semibold">デッキを作成する</h2>
        <Form method="post">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <input
              type="text"
              placeholder="デッキコード（必須）"
              className="input input-bordered input-lg w-full max-w-lg mt-2"
              name="code"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="デッキ名（必須）"
              className="input input-bordered input-lg w-full max-w-lg mt-2"
              name="title"
            />
          </div>
          <div>
            <textarea
              placeholder="デッキの説明"
              className="textarea textarea-bordered textarea-lg w-full max-w-lg min-h-[300px] mt-2"
              name="description"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "デッキを作成しています..." : "作成"}
          </button>
          <p className="text-xs text-error mt-2">
            通信状況によっては、デッキの作成に時間がかかることがあります。10秒から30秒程度お待ちください。
          </p>
        </Form>
      </div>
    </div>
  );
}
