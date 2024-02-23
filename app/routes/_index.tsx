import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import header_logo from "../images/header_logo.jpg";

interface Env {
  DB: D1Database;
}

type Post = {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.env as Env;

  const { results } = await env.DB.prepare("SELECT * FROM posts").all<Post>();

  return json({
    posts: results ?? [],
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <img src={header_logo} alt="サイトのロゴ" width={40} height={40} />
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>
        <h1>Posts</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.content}</li>
          ))}
        </ul>
      </AppShell.Main>
    </AppShell>
  );
}
