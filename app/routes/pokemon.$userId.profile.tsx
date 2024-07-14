import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { NavLink, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { redirectWithError } from "remix-toast";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { userId } = params;
  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  return json({ user });
}

export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>ユーザー プロフィール</h1>
      <div>
        <img src={user.iconUrl} alt="ユーザーアイコン" />
      </div>
      <div>
        <h2>{user.displayName}</h2>
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to={`/pokemon/${user.id}/decks`}>デッキ一覧</NavLink>
          </li>
          <li>
            <NavLink to={`/pokemon/${user.id}/settings`}>設定</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
