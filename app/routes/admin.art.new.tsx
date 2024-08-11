import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createArt } from "~/features/common/services/data.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return { user };
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  await createArt(formData, context);
  return redirect("/admin");
};

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="card max-w-lg bg-base-100 shadow-xl m-2">
        <span>作品を投稿する</span>
        <Form method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input
            type="text"
            placeholder="タイトル"
            className="input input-bordered input-lg w-full max-w-xs m-2"
            name="title"
          />
          <textarea
            placeholder="作品の詳細"
            className="textarea textarea-bordered textarea-lg w-full max-w-xs m-2"
            name="content"
          ></textarea>
          <input
            type="text"
            placeholder="価格"
            className="input input-bordered input-lg w-full max-w-xs m-2"
            name="price"
          />
          <p className="text-xs text-gray-500">半角数字で入力してください</p>
          <input
            type="text"
            placeholder="商品の販売ページURL"
            className="input input-bordered input-lg w-full max-w-xs m-2"
            name="productUrl"
          />
          <button
            type="submit"
            className="btn btn-info mb-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "ポスト"}
          </button>
        </Form>
      </div>
    </>
  );
}
