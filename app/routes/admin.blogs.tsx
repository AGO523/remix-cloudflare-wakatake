import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { client } from "~/features/common/services/cms-client.server";
import { getAuthenticator } from "~/features/common/services/auth.server";

// {
//   "contents": [
//       {
//           "id": "mmmwgae0ml0n",
//           "createdAt": "2024-04-03T23:40:33.311Z",
//           "updatedAt": "2024-04-03T23:40:33.311Z",
//           "publishedAt": "2024-04-03T23:40:33.311Z",
//           "revisedAt": "2024-04-03T23:40:33.311Z",
//           "title": "test",
//           "content": "<p>はしもとみお Mio Hashimoto 動物たちと向き合うたび、人と動物、ではなくて、個と個の対話を感じます。 ただの犬ではなく、ただの猿ではなく、世界にひとつの、たったひとつのいのち対いのち。 そんな風にむきあいながら、動物たちの肖像彫刻を続けて行きたいと思っています。 たくさんの人に、知ってもらいたい命がある、それを届ける仕事を、これからも続けて行こうと思っています。 Every time I come face to face with animals, I feel that the dialogue is not between &quot;human&quot; and &quot;animal,&quot; but between individual and individual. It&apos;s not just a dog, it&apos;s not just a monkey, it&apos;s one and only &quot;life&quot; versus &quot;life&quot; in the world.I would like to continue to make portrait sculptures of animals while facing such things. There are lives that I want many people to know about.I would like to continue my work to deliver them.</p><figure><img src=\"https://images.microcms-assets.io/assets/9e70aada252946b99c8bfc1fcd888812/358e38c9788f43b688307f22676bc5a4/blog-template-description2.png\" alt=\"\" width=\"2492\" height=\"1648\"></figure>"
//       }
//   ],
//   "totalCount": 1,
//   "offset": 0,
//   "limit": 10
// }

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
