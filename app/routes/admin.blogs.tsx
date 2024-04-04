import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { client } from "~/features/common/services/cms-client.server";
import { getAuthenticator } from "~/features/common/services/auth.server";

type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  eyecatch: {
    url: string;
    width: number;
    height: number;
  };
};

type LoaderData = {
  contents: Blog[];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  // microCMS からデータを取得
  const data = await client.get({
    endpoint: "artora",
  });
  return data;
}

export default function Blog() {
  const { contents } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      {contents.map((blog) => (
        <article key={blog.id}>
          <h1>{blog.title}</h1>
          <div
            dangerouslySetInnerHTML={{
              __html:
                blog.content.slice(0, 40) +
                (blog.content.length > 40 ? "..." : ""),
            }}
          />
          <p>記事作成日: {blog.createdAt}</p>
          {blog.eyecatch && (
            <img src={blog.eyecatch.url} alt="" width={400} height={400} />
          )}
        </article>
      ))}
    </div>
  );
}
