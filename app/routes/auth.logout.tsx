import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/features/common/services/auth.server";

export const loader = ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context);
  return authenticator.logout(request, {
    redirectTo: "/login",
  });
};
