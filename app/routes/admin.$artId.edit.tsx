import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getArtBy, updateArt } from "~/features/common/services/data.server";

type ActionResponse = {
  message?: string;
  success?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  const artId = Number(params.artId);
  const art = await getArtBy(artId, context);
  return json({ art });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  await updateArt(formData, context);
  return redirect("/admin");
};

export default function EditArt() {
  const { art } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <div className="container mx-auto">
        <h1>作品</h1>
        {art ? (
          <Form method="post">
            <div className="form-control">
              <label htmlFor="title">タイトル</label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={art.title}
              />
            </div>
            <div className="form-control">
              <label htmlFor="content">内容</label>
              <textarea
                id="content"
                name="content"
                defaultValue={art.content}
              />
            </div>
            <div className="form-control">
              <label htmlFor="price">価格</label>
              <input
                type="text"
                id="price"
                name="price"
                defaultValue={art.price}
              />
            </div>
            <p className="text-xs text-gray-500">半角数字で入力してください</p>
            <div className="form-control">
              <label htmlFor="productUrl">商品の販売ページURL</label>
              <input
                type="text"
                id="productUrl"
                name="productUrl"
                defaultValue={art.productUrl || ""}
              />
            </div>
            <input type="hidden" name="artId" value={art.id} />
            <div className="form-control">
              <button
                type="submit"
                className="btn btn-info m-2"
                disabled={isSubmitting}
              >
                作品を更新
              </button>
            </div>
          </Form>
        ) : (
          <p>表示する作品がありません。</p>
        )}
      </div>

      {actionData?.message && (
        <div
          className={`toast ${
            actionData.success ? "toast-success" : "toast-error"
          }`}
        >
          <div className="alert alert-info">
            <span>{actionData.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
