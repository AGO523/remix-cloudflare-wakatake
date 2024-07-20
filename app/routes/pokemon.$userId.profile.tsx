import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getUserBy } from "~/features/common/services/deck-data.server";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

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
    <div className="card bg-base-200 shadow-md mb-4 max-w-2xl w-full p-4">
      <div className="flex flex-col items-center">
        <div className="avatar mb-4">
          {user.avatarUrl && (
            <img
              src={user?.avatarUrl}
              alt="アバターの画像"
              className="w-16 h-16 rounded-full"
            />
          )}
        </div>

        <div className="card-body items-center mb-4">
          <p className="card-title">
            {user.nickname ? user.nickname : `トレーナー_${user.id}`}
          </p>
          <p className="card-subtitle text-gray-500">
            {"自己紹介が設定されていません"}
          </p>
        </div>

        {user && user.id === currentUser.id && (
          <>
            <Link
              to={`/pokemon/${user.id}/profile/edit`}
              className="btn btn-primary"
            >
              プロフィールの変更
            </Link>
          </>
        )}
      </div>
      <div>
        <Link className="btn mt-2" to={`/pokemon/${user.id}/decks`}>
          デッキ一覧
        </Link>
      </div>

      <div>
        <Link className="btn btn-error mt-2" to="/auth/logout">
          ログアウト
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
