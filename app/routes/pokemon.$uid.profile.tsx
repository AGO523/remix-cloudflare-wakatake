import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import { getUserByUid } from "~/features/common/services/deck-data.server";

// デッキ上部のアイコンから遷移してきた場合は、userID がある
// フッターからの遷移は自分自身で確定で、userId はない、uid はある
// フッターからの遷移の場合はユーザー固有のマイページ
// それ以外はProfile ページとして見えるようにする

// 一旦はユーザー固有のページとして作成
export async function loader({ params, context }: LoaderFunctionArgs) {
  const uid = params.uid || "";
  const user = await getUserByUid(uid, context);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ paramsUser: user });
}

export default function UserProfileLayout() {
  const { paramsUser } = useLoaderData<typeof loader>();
  const { user } = useAuthGuard(paramsUser.uid);

  return (
    <>
      <div className="card bg-base-200 shadow-md mb-4 max-w-3xl w-full p-4">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            {paramsUser.avatarUrl && (
              <img
                src={paramsUser?.avatarUrl}
                alt="アバターの画像"
                className="w-24 h-24 rounded-full"
              />
            )}
          </div>

          <div className="card-body items-center mb-4">
            <p className="card-title">
              {paramsUser.nickname
                ? paramsUser.nickname
                : `ユーザー_${paramsUser.id}`}
            </p>
            <p className="card-subtitle text-gray-500">
              {paramsUser.bio ? paramsUser.bio : "自己紹介が設定されていません"}
            </p>
          </div>

          <NavLink
            to={`/pokemon/${paramsUser.id}/decks`}
            end
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-base-content"
            }
          >
            <div className="btn btn-primary">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <span className="ml-1">マイデッキ</span>
              </div>
            </div>
          </NavLink>

          <div className="flex items-center space-x-2 mt-4">
            {paramsUser && paramsUser.uid === user?.uid && (
              <>
                <Link
                  to={`/pokemon/${paramsUser.uid}/profile/edit`}
                  className="btn btn-info"
                >
                  プロフィールの変更
                </Link>
                <Link
                  to={`/pokemon/${paramsUser.uid}/profile/avatar_edit`}
                  className="btn btn-info"
                >
                  アバターの変更
                </Link>
              </>
            )}
          </div>

          {paramsUser && paramsUser.uid === user?.uid && (
            <div className="mt-2">
              <Link className="btn" to="/login">
                アカウント管理
              </Link>
            </div>
          )}
        </div>

        <Outlet />
      </div>
    </>
  );
}
