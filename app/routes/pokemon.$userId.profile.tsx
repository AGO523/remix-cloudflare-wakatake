import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getUserBy } from "~/features/common/services/deck-data.server";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const paramsUserId = Number(params.userId);
  const user = await getUserBy(paramsUserId, context);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ user });
}

export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="card bg-base-200 shadow-md mb-4 max-w-2xl w-full p-4">
      <div className="flex flex-col items-center">
        <div className="avatar mb-4">
          {user.iconUrl && (
            <img
              src={user.iconUrl}
              alt="ユーザーアイコン"
              className="w-16 h-16 rounded-full"
            />
          )}
        </div>

        <div className="card-body items-center mb-4">
          <p className="card-title">
            {user.displayName.length > 0 ? user.displayName : ""}
          </p>
          <p className="card-subtitle text-gray-500">
            {"自己紹介が設定されていません"}
          </p>
        </div>

        {user && (
          <>
            <div className="btn btn-primary m-2">プロフィールの変更</div>
            <NavLink
              to={`/pokemon/${user.id}/settings`}
              className="btn btn-ghost"
            >
              アカウント設定
            </NavLink>
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
    </div>
  );
}
