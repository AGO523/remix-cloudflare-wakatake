import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { updateUserProfile } from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const paramsUserId = Number(params.userId);
  if (Number(paramsUserId) !== user.id) {
    return redirectWithError(
      `/pokemon/${paramsUserId}/profile`,
      "アクセス権限がありません"
    );
  }
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ user });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const response = await updateUserProfile(Number(userId), formData, context);

  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${userId}/profile`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${userId}/profile/edit`,
    responseData.message
  );
};

export default function EditProfile() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="p-8 w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          プロフィールの変更
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div>
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt="ユーザーアイコン"
                className="w-16 h-16 rounded-full"
              />
            )}
          </div>
          <input
            type="text"
            placeholder="ユーザー名"
            className="input input-bordered input-lg w-full max-w-lg mt-2"
            name="nickname"
            defaultValue={user?.nickname || ""}
          />
          <div>
            <textarea
              placeholder="自己紹介"
              className="textarea textarea-bordered textarea-lg w-full max-w-lg mt-2"
              name="bio"
              defaultValue={user.bio || ""}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
          <Link to="../" className="btn btn-error mt-4">
            キャンセル
          </Link>
        </Form>
      </div>
    </div>
  );
}
