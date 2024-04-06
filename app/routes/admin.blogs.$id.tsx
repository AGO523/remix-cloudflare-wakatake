import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { client } from "~/features/common/services/cms-client.server";

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

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  const contentId = params.id;
  const data = await client.get({
    endpoint: "artora",
    contentId: contentId,
  });
  return { contents: [data] };
}

export default function Blog() {
  const { contents } = useLoaderData<LoaderData>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      {contents.map((blog) => (
        <article key={blog.id} className="m-4">
          <div className="card max-w-2xl bg-base-100 shadow-xl">
            {blog.eyecatch && (
              <figure>
                <img src={blog.eyecatch.url} alt="Shoes" />
              </figure>
            )}
            <div className="card-body">
              <h2>{blog.title}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: blog.content,
                }}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
