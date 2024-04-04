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
                  to="/admin/blog/new"
                  className="btn btn-sm btn-block btn-secondary"
                >
                  ブログを新規作成
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
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
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
