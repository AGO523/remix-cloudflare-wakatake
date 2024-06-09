import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createDeck } from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
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
  return redirectWithError(`/pokemon/${userId}/decks`, responseData.message);
};

export default function DeckNew() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="w-full">
          <h2 className="text-2xl font-semibold text-center mb-6">
            デッキを作成する
          </h2>
          <Form method="post">
            <input type="hidden" name="userId" value={user.id} />
            <input
              type="text"
              placeholder="デッキコード（必須）"
              className="input input-bordered input-lg w-full mt-2"
              name="code"
            />
            <input
              type="text"
              placeholder="デッキ名（必須）"
              className="input input-bordered input-lg w-full mt-2"
              name="title"
            />
            <textarea
              placeholder="デッキの説明"
              className="textarea textarea-bordered textarea-lg w-full min-h-[300px] mt-2"
              name="description"
            ></textarea>
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
    </>
  );
}
