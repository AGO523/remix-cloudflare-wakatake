import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getArtsWithImages,
  deleteArt,
} from "~/features/common/services/data.server";

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
          <div key={art.id} className="card max-w-lg bg-base-100 shadow-xl m-2">
            <h2 className="card-title">{art.title}</h2>
            <div className="card-body">
              <p>{art.content}</p>
              {art.images?.map((image) => (
                <img
                  key={image.id}
                  src={image.imageUrl}
                  alt="作品の画像"
                  className="m-2"
                />
              ))}
            </div>
            <div className="card-actions justify-end">
              <Link to={`/admin/${art.id}/upload-image`} className="btn">
                画像をアップロード
              </Link>
              <Link to={`/admin/${art.id}/edit`} className="btn">
                編集
              </Link>
              <Form method="post" onSubmit={(e) => handleDelete(e, art.id)}>
                <input type="hidden" name="artId" value={art.id} />
                <button
                  type="submit"
                  name="_action"
                  value="delete"
                  className="btn btn-error"
                >
                  削除
                </button>
              </Form>
            </div>
          </div>
        ))
      ) : (
        <p>表示する作品がありません。</p>
      )}
    </>
  );
}
