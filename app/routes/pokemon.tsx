import type {
  MetaFunction,
  LoaderFunctionArgs,
  LinksFunction,
} from "@remix-run/cloudflare";
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

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "https://storage.googleapis.com/prod-artora-arts/dev-images/hura_icon2.png",
    type: "image/png",
  },
];

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
        <div className="flex flex-col justify-center items-center">
          <Outlet />
        </div>
      </section>

      <section>
        <div className="p-6 sm:p-12 bg-neutral text-gray-100">
          <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
            <img
              src="https://storage.googleapis.com/prod-artora-arts/dev-images/dorapa_aka_icon.png"
              alt="アートラのアイコン"
              className="self-center flex-shrink-0 w-24 h-24 border rounded-full md:justify-self-start bg-base-100 border-gray-700"
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
      </section>

      {/* ナビゲーションバー */}
      {user ? (
        <div className="fixed inset-x-0 bottom-0 bg-base-100 p-2 bg-opacity-60">
          <div className="flex justify-around text-center">
            <NavLink
              to={`/pokemon/${user.id}/decks`}
              end
              className={({ isActive }) =>
                isActive ? "text-info" : "text-gray-700"
              }
            >
              <div className="flex flex-col items-center">
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
                <span className="text-xs mt-1">マイデッキ</span>
              </div>
            </NavLink>
            <NavLink
              to={`/pokemon/${user.id}/decks/new`}
              className={({ isActive }) =>
                isActive ? "text-info" : "text-gray-700"
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
                isActive ? "text-info" : "text-gray-700"
              }
            >
              <div className="flex flex-col items-center">
                <svg
                  fill="none"
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
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                  />
                </svg>
                <span className="text-xs mt-1">マイページ</span>
              </div>
            </NavLink>
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 bg-base-100 p-2 bg-opacity-60">
          <div className="flex justify-around text-center">
            <NavLink
              to="/pokemon/decks"
              end
              className={({ isActive }) =>
                isActive ? "text-info" : "text-gray-700"
              }
            >
              <div className="flex flex-col items-center">
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
                <span className="text-xs mt-1">みんなのデッキ</span>
              </div>
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-gray-700"
              }
            >
              <div className="flex flex-col items-center">
                <svg
                  fill="none"
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
                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                  />
                </svg>
                <span className="text-xs mt-1">ログイン</span>
              </div>
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}
