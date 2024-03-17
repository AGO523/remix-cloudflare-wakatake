import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getArtsWithImages,
  createArt,
  deleteArt,
} from "~/features/common/services/data.server";

type ActionResponse = {
  message?: string;
  success?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
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
  const arts = await getArtsWithImages(context);
  return json({ arts, user });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  if (actionType === "delete") {
    return await deleteArt(formData, context);
  }
  return await createArt(formData, context);
};

export default function Admin() {
  const { arts, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();

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
      <div className="container mx-auto">
        <div className="badge badge-primary">user: {user.displayName}</div>

        <div className="card max-w-lg bg-base-100 shadow-xl m-2">
          <span>作品を投稿する</span>
          <Form method="post">
            <input type="hidden" name="userId" value={user.id} />
            <input
              type="text"
              placeholder="タイトル"
              className="input input-bordered input-lg w-full max-w-xs m-2"
              name="title"
            />
            <textarea
              placeholder="作品の詳細"
              className="textarea textarea-bordered textarea-lg w-full max-w-xs m-2"
              name="content"
            ></textarea>
            <button type="submit" className="btn btn-primary mb-4">
              ポスト
            </button>
          </Form>
        </div>

        <h1>作品</h1>
        {arts ? (
          arts.map((art) => (
            <div
              key={art.id}
              className="card max-w-lg bg-base-100 shadow-xl m-2"
            >
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
      </div>

      {actionData?.message && (
        <div
          className={`toast ${
            actionData.success ? "toast-success" : "toast-error"
          }`}
        >
          <div className="alert alert-info">
            <span>{actionData.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
