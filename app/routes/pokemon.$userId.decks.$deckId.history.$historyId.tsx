import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  if (params === undefined || params === null) {
    throw new Response("Params is required", { status: 400 });
  }
  return {};
}

export default function DeckHistoryLayout() {
  return (
    <div className="container mx-auto p-2">
      <Outlet />
    </div>
  );
}
