import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  console.log("Loader function called");
  console.log("Request:", request);
  console.log("Context:", context);

  const authenticator = getAuthenticator(context);
  console.log("Authenticator:", authenticator);

  const isAuthenticated = await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  console.log("Authentication Result:", isAuthenticated);

  return isAuthenticated;
}

export default function Login() {
  return (
    <>
      <section className="flex flex-row items-center justify-center mt-4">
        <h1 className="text-2xl font-bold">Login</h1>
      </section>
      <section className="flex flex-row items-center justify-center mt-4">
        <Form method="post" action="/auth/google">
          <button type="submit">Login with Google</button>
        </Form>
      </section>
    </>
  );
}
