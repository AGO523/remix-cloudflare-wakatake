import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getArts, createArt } from "~/features/common/services/data.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  const arts = await getArts(context);
  return json({ arts, user });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  return await createArt(formData, context);
};

export default function Admin() {
  const { arts, user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="container mx-auto">
        <div className="badge badge-primary">user: {user.displayName}</div>

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
            <button type="submit" className="btn btn-primary mb-4">
              ポスト
            </button>
          </Form>
        </div>

        <h1>作品</h1>
        {arts ? (
          arts.map((art) => (
            <div
              key={art.id}
              className="card max-w-lg bg-base-100 shadow-xl m-2"
            >
              <h2 className="card-title">{art.title}</h2>
              <div className="card-body">
                <p>{art.content}</p>
              </div>
              <div className="card-actions justify-end">
                <Link to={`/admin/${art.id}/edit`} className="btn btn-sm">
                  編集
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>表示する作品がありません。</p>
        )}
      </div>
    </>
  );
}
