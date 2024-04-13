import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData, useLocation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getArtsWithImages,
  deleteArt,
} from "~/features/common/services/data.server";
import { ArtCard } from "~/features/common/components/ArtCard";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const adminIds = [1, 2];
  if (!adminIds.includes(user.id)) {
    throw new Response("Forbidden", { status: 403 });
  }
  const arts = await getArtsWithImages(context);
  return json({ arts });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  return await deleteArt(formData, context);
};

export default function Admin() {
  const { arts } = useLoaderData<typeof loader>();
  const location = useLocation();
  console.log(location.pathname);

  function handleDelete(e: React.FormEvent<HTMLFormElement>, artId: number) {
    e.preventDefault(); // フォームのデフォルトの送信を阻止
    if (confirm("本当にこの作品を削除しますか？")) {
      const form = new FormData();
      form.append("artId", String(artId));
      form.append("_action", "delete");

      fetch(e.currentTarget.action, {
        method: "POST",
        body: form,
      }).then(() => {
        window.location.reload(); // ページをリロード
      });
    }
  }

  return (
    <>
      {arts ? (
        arts.map((art) => (
          <div key={art.id} className="m-2">
            <ArtCard
              art={{
                id: art.id,
                title: art.title,
                content: art.content,
                price: art.price,
                productUrl: art.productUrl || undefined,
              }}
              artImages={art.images || []}
              adminPath={true}
            />
            <Form method="post" onSubmit={(e) => handleDelete(e, art.id)}>
              <input type="hidden" name="artId" value={art.id} />
              <button
                type="submit"
                name="_action"
                value="delete"
                className="btn btn-error mt-1"
              >
                ↑の作品を削除
              </button>
            </Form>
          </div>
        ))
      ) : (
        <p>表示する作品がありません。</p>
      )}
    </>
  );
}
