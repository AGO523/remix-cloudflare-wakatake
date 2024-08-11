import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
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

export default function Blogs() {
  const { contents } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <button className="btn btn-info btn-sm">
        <Link
          to="https://artora.microcms.io/apis/artora"
          target="_blank"
          rel="noreferrer"
        >
          ブログを新規作成
        </Link>
      </button>
      {contents.map((blog) => (
        <article key={blog.id} className="m-4">
          <div className="card lg:card-side bg-base-100 shadow-xl">
            {blog.eyecatch && (
              <figure>
                <img
                  src={blog.eyecatch.url}
                  alt="ブログの画像"
                  className="max-w-96 max-h-96"
                />
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title">{blog.title}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    blog.content.slice(0, 40) +
                    (blog.content.length > 40 ? "..." : ""),
                }}
              />
              <p>記事作成日: {blog.createdAt.slice(0, 10)}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-info">
                  <Link to={`/admin/blogs/${blog.id}`}>ブログを読む</Link>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
