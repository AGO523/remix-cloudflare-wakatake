import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import google_icon from "../images/google_icon.png"; // アイコンのパスを確認してください

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const isAuthenticated = await authenticator.isAuthenticated(request, {
    successRedirect: "/pokemon",
  });
  return isAuthenticated;
}

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-8 rounded-lg shadow-lg max-w-md w-full mt-[-20%]">
        <h1 className="text-3xl font-bold text-center mb-6">ログイン</h1>
        <Form
          method="post"
          action="/auth/google"
          className="flex justify-center"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
          >
            <img src={google_icon} alt="Google icon" className="w-6 h-6 mr-3" />
            Googleアカウントでログイン
          </button>
        </Form>
      </div>
    </div>
  );
}
