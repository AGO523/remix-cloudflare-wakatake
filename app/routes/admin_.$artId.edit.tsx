import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getArtBy, updateArt } from "~/features/common/services/data.server";

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
            <input type="hidden" name="artId" value={art.id} />
            <div className="form-control">
              <button type="submit" className="btn btn-primary">
                保存
              </button>
            </div>
          </Form>
        ) : (
          <p>表示する作品がありません。</p>
        )}
      </div>
    </>
  );
}
