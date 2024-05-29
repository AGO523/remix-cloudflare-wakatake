import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  redirect,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createDeck } from "~/features/common/services/deck-data.server";

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
  if (response && response.status === 201) {
    return redirect(`/pokemon/${userId}/decks`);
  }
  return json({ message: "デッキの投稿に失敗しました" }, { status: 500 });
};

export default function DeckNew() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="card bg-base-200 max-w-3xl shadow-xl p-2">
        <div className="m-4">デッキを作成する</div>
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
            className="textarea textarea-bordered textarea-lg w-full min-h-[400px] mt-2"
            name="description"
          ></textarea>
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "デッキを作成しています..." : "送信"}
          </button>
        </Form>
      </div>
    </>
  );
}
