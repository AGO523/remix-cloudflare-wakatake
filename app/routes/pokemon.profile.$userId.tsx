import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getUserBy } from "~/features/common/services/deck-data.server";

// マイページ
// デッキ上部のアイコンから遷移してきた場合は、userID がある
// フッターからの遷移は自分自身で確定で、userId はない、uid はある
// フッターからの遷移の場合はユーザー固有のマイページ
// それ以外はProfile ページとして見えるようにする
export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request);

  const paramsUserId = Number(params.userId);
  const user = await getUserBy(paramsUserId, context);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ user, currentUser });
}

export default function UserProfileLayout() {
  const { user, currentUser } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="card bg-base-200 shadow-md mb-4 max-w-3xl w-full p-4">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            {user.avatarUrl && (
              <img
                src={user?.avatarUrl}
                alt="アバターの画像"
                className="w-24 h-24 rounded-full"
              />
            )}
          </div>

          <div className="card-body items-center mb-4">
            <p className="card-title">
              {user.nickname ? user.nickname : `ユーザー_${user.id}`}
            </p>
            <p className="card-subtitle text-gray-500">
              {user.bio ? user.bio : "自己紹介が設定されていません"}
            </p>
          </div>

          <div>
            {user && user.id === currentUser?.id && (
              <>
                <Link
                  to={`/pokemon/${user.id}/profile/edit`}
                  className="btn btn-info"
                >
                  プロフィールの変更
                </Link>
                <Link
                  to={`/pokemon/${user.id}/profile/avatar_edit`}
                  className="btn btn-info ml-2"
                >
                  アバターの変更
                </Link>
              </>
            )}
          </div>
          <div className="mt-2">
            <Link className="btn btn-info" to={`/pokemon/${user.id}/decks`}>
              このユーザーのデッキを見る
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
