import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Outlet, NavLink, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  return json({ user });
}

export default function DecksByUserLayout() {
  const { user } = useLoaderData<typeof loader>();
  const userId = user?.id;

  return (
    <div className="container mx-auto">
      <div className="mt-8">
        <Outlet />
      </div>

      {/* ナビゲーションバー */}
      <div className="fixed inset-x-0 bottom-0 bg-base-100 p-2">
        <div className="flex justify-around text-center">
          <NavLink
            to={`/pokemon/${userId}/decks`}
            end
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <div className="flex flex-col items-center">
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
              <span className="text-xs mt-1">ホーム</span>
            </div>
          </NavLink>
          <NavLink
            to={`/pokemon/${userId}/decks/new`}
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <div className="flex flex-col items-center">
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
                  d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
              <span className="text-xs mt-1">デッキ作成</span>
            </div>
          </NavLink>
          <NavLink
            to="/admin/blogs"
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-gray-700"
            }
          >
            <div className="flex flex-col items-center">
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
                />
              </svg>
              <span className="text-xs mt-1">ブログ</span>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
