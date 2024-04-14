import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  Link,
  useLoaderData,
  useActionData,
  Outlet,
  NavLink,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

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
  return json({ user });
}

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* サイドバー */}
      <div className="md:w-64 w-full flex-shrink-0 bg-base-200 max-h-screen overflow-auto hidden md:block">
        <div className="flex items-center justify-center h-16 shadow-md">
          <h1 className="text-lg font-semibold">管理画面</h1>
        </div>
        <div className="p-5">
          <div className="flex flex-col items-center">
            <span>
              ユーザー:
              <span className="badge badge-primary ml-1">
                {user.displayName}
              </span>
            </span>
          </div>
          <div className="mt-5">
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  to="/admin"
                  className="btn btn-sm btn-block btn-secondary"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/art/new"
                  className="btn btn-sm btn-block btn-secondary"
                >
                  作品を新規作成
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/blogs"
                  className="btn btn-sm btn-block btn-secondary"
                >
                  ブログ
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/logout"
                  className="btn btn-sm btn-block btn-primary"
                >
                  ログアウト
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-5 overflow-auto">
        <Outlet />
      </div>

      {/* ナビゲーションバー */}
      <div className="fixed inset-x-0 bottom-0 bg-base-200 md:hidden p-4">
        <div className="flex justify-around text-center">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </NavLink>
          <NavLink
            to="/admin/art/new"
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
              />
            </svg>
          </NavLink>
          <NavLink
            to="/admin/blogs"
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              ></path>
            </svg>
          </NavLink>
        </div>
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
    </div>
  );
}
