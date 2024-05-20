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
      <div className="card max-w-lg bg-base-100 shadow-xl m-2">
        <span>デッキを投稿する</span>
        <Form method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input
            type="text"
            placeholder="デッキコード"
            className="input input-bordered input-lg w-full max-w-xs m-2"
            name="code"
          />
          <input
            type="text"
            placeholder="デッキ名"
            className="input input-bordered input-lg w-full max-w-xs m-2"
            name="title"
          />
          <textarea
            placeholder="デッキの説明"
            className="textarea textarea-bordered textarea-lg w-full max-w-xs m-2"
            name="description"
          ></textarea>
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs m-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "デッキを作成しています..." : "送信"}
          </button>
        </Form>
      </div>
    </>
  );
}
