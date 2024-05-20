import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({ user });
}

export default function DecksByUser() {
  return (
    <div className="container mx-auto p-4">
      <Link
        to="/pokemon/deck/new"
        className="btn btn-primary m-2"
        prefetch="intent"
      >
        デッキを登録する
      </Link>
      <Outlet />
    </div>
  );
}
