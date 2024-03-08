import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createArt } from "~/data";

interface Env {
  DB: D1Database;
}

type Arts = {
  id: number;
  userId: number;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const env = context.env as Env;

  const { results } = await env.DB.prepare("SELECT * FROM arts").all<Arts>();

  return json({
    arts: results ?? [],
    user: user,
  });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const formData = await request.formData();
  return await createArt(formData, env);
};

export default function Admin() {
  const { arts, user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="container mx-auto">
        <div className="badge badge-primary">user: {user.displayName}</div>

        <h1>作品</h1>
        {arts.length > 0 ? (
          arts.map((art) => (
            <div
              key={art.id}
              className="card max-w-lg bg-base-100 shadow-xl m-2"
            >
              <h2 className="card-title">Card title!</h2>
              <div className="card-body">
                <p>{art.content}</p>
              </div>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Buy Now</button>
              </div>
            </div>
          ))
        ) : (
          <p>表示する作品がありません。</p>
        )}

        <div>
          <span>作品を投稿する</span>
          <Form method="post">
            <input type="hidden" name="userId" value={user.id} />
            <textarea
              placeholder="作品の詳細"
              className="textarea textarea-bordered textarea-lg w-full max-w-xs"
              name="content"
            ></textarea>
            <button type="submit" className="btn btn-primary">
              ポスト
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}
