import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, redirect, useLoaderData, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { createDialy } from "~/features/common/services/data.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return { user };
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  await createDialy(formData, context);
  return redirect("/dialies");
};

export default function DialyNew() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="card max-w-3xl bg-base-100 shadow-md">
        <div className="card-body">
          <p>護主印日記の新規作成</p>
          <p>今日を振り返り、3行の日記を書きましょう。</p>
          <Form method="post">
            <input type="hidden" name="userId" value={user.id} />
            <textarea
              placeholder="日記の内容"
              className="textarea textarea-bordered textarea-lg w-full max-w-3xl m-2"
              name="content"
            ></textarea>
            <button
              type="submit"
              className="btn btn-info mb-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "送信中..." : "作成"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
