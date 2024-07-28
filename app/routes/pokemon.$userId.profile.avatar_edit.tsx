import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getUserBy,
  getCardImagesBy,
  updateUserAvatar,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";
import CardImages from "~/features/common/components/CardImages";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const paramsUserId = Number(params.userId);
  if (Number(paramsUserId) !== currentUser.id) {
    return redirectWithError(
      `/pokemon/${paramsUserId}/profile`,
      "アクセス権限がありません"
    );
  }
  const user = await getUserBy(currentUser.id, context);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // user_id が 1（管理者）の cardImages を取得して返す
  const cardImages = await getCardImagesBy(1, context);
  return json({ user, cardImages });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const response = await updateUserAvatar(Number(userId), formData, context);

  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(
      `/pokemon/${userId}/profile`,
      responseData.message
    );
  }
  return redirectWithError(
    `/pokemon/${userId}/profile/avatar_edit`,
    responseData.message
  );
};

export default function EditProfile() {
  const { user, cardImages } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex justify-center items-center">
      <div className="p-8 w-full">
        <h2 className="text-xl font-semibold text-center mt-2 mb-6">
          アバターの変更
        </h2>
        <CardImages cardImages={cardImages} />
        <Form method="post" className="space-y-4">
          <p className="text-sm text-gray-500 mt-2">
            画像をクリックしてURLをコピーしてください
          </p>
          <input type="hidden" name="userId" value={user.id} />
          <input
            type="text"
            placeholder="アバターのURL"
            className="input input-bordered w-full max-w-lg mt-2"
            name="avatarUrl"
            defaultValue={user.avatarUrl || ""}
          />
          <button
            type="submit"
            className="btn btn-primary w-full max-w-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
          <div className="mt-2">
            <Link to="../" className="btn btn-ghost">
              キャンセル
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
