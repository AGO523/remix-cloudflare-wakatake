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
  return createArt(formData, env);
};

export default function Admin() {
  const { arts, user } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>arts</h1>
      <ul>
        {arts.map((post) => (
          <li key={post.id}>{post.content}</li>
        ))}
      </ul>

      <h1>Admin</h1>
      <ul>
        <li>user: {user.id}</li>
        <li>user: {user.displayName}</li>
      </ul>

      <div>
        <span>作品を投稿する</span>
        <Form method="post">
          <input type="hidden" name="userId" value={user.id} />
          <input type="text" name="content" />
          <button type="submit">投稿</button>
        </Form>
      </div>
    </>
  );
}
