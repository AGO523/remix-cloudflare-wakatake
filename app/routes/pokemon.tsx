import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, NavLink, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { json } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "ポケヒス" },
    { name: "description", content: "ポケヒス" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  return json({ user });
}

export default function PokemonLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <section>
        <div className="container flex flex-col items-center px-4 py-16 pb-24 mx-auto text-center">
          <Outlet />
        </div>
      </section>

      <div className="p-6 sm:p-12 bg-neutral text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src="https://storage.googleapis.com/prod-artora-arts/dev-images/artora-icon.png"
            alt="アートラのアイコン"
            className="self-center flex-shrink-0 w-24 h-24 border rounded-full md:justify-self-start dark:bg-secondary dark:border-gray-700"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              ポケヒス
            </h4>
            <p className="dark:text-gray-400">
              ポケモンカードのデッキを管理することができます。デッキ構築の履歴を残したり、他の人に共有したりできます。
            </p>
          </div>
        </div>
        <div className="flex justify-center pt-4 space-x-4 align-center"></div>
      </div>

      {/* ナビゲーションバー */}
      {user && (
        <div className="fixed inset-x-0 bottom-0 bg-base-100 p-2">
          <div className="flex justify-around text-center">
            <NavLink
              to={`/pokemon/${user.id}/decks`}
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
              to={`/pokemon/${user.id}/decks/new`}
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
              to={`/pokemon/${user.id}/profile`}
              className={({ isActive }) =>
                isActive ? "text-primary" : "text-gray-700"
              }
            >
              <div className="flex flex-col items-center">
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  ></path>
                </svg>
                <span className="text-xs mt-1">マイページ</span>
              </div>
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}
