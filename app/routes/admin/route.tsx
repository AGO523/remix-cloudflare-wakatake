import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

interface Env {
  DB: D1Database;
}

type Arts = {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
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

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Admin() {
  const { arts } = useLoaderData<typeof loader>();
  const { user } = useLoaderData<typeof loader>();

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
    </>
  );
}
