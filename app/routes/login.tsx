import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const isAuthenticated = await authenticator.isAuthenticated(request, {
    successRedirect: "/pokemon",
  });
  return isAuthenticated;
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">ログイン</h1>
        <Form
          method="post"
          action="/auth/google"
          className="flex justify-center"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            <svg
              className="w-6 h-6 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.14 0 5.25 1.37 6.5 2.5l4.5-4.5C32.65 5.5 28.8 3.5 24 3.5 15.75 3.5 8.4 9.2 6 16.5l5.5 4.5C12.9 14 18 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.6 0 10.4-1.8 14-5L33.5 34C31 35.5 27.8 36.5 24 36.5c-6 0-11.1-4.1-12.8-9.6L6 30.5C8.5 37.7 15.7 44 24 44z"
              />
              <path
                fill="#4A90E2"
                d="M6 16.5C4.9 18.8 4.5 21.3 4.5 24s.4 5.2 1.5 7.5l6.5-5C11.1 24 11 24 11 24s-.2-2.5 0-5L6 16.5z"
              />
              <path
                fill="#FBBC05"
                d="M24 9.5V4.5c-4.9 0-9.3 2-12.5 5l5 5C18.7 11.2 21.2 9.5 24 9.5zM11 24s.1 2.5 0 5L6 31.5c2.6 4.8 7.6 8.5 13 8.5v-5c-2.8 0-5.3-1.7-6.5-4l-6.5 5z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Googleアカウントでログイン
          </button>
        </Form>
      </div>
    </div>
  );
}
