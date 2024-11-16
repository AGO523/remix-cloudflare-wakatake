import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  Link,
} from "@remix-run/react";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";
import {
  getUserByUid,
  updateUserProfile,
} from "~/features/common/services/deck-data.server";
import { redirectWithSuccess, redirectWithError } from "remix-toast";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const uid = params.uid || "";
  const user = await getUserByUid(uid, context);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ paramsUser: user });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const uid = formData.get("uid");
  const response = await updateUserProfile(Number(userId), formData, context);

  const responseData = await response.json();
  if (response.status === 200) {
    return redirectWithSuccess(`/pokemon/${uid}/profile`, responseData.message);
  }
  return redirectWithError(
    `/pokemon/${uid}/profile/edit`,
    responseData.message
  );
};

export default function EditProfile() {
  const { paramsUser } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  useAuthGuard(paramsUser.uid);

  return (
    <div className="flex justify-center items-center">
      <div className="p-8 w-full">
        <h2 className="text-xl font-semibold text-center mb-6">
          プロフィールの変更
        </h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={paramsUser.id} />
          <input type="hidden" name="uid" value={paramsUser.uid} />
          <input
            type="text"
            placeholder="ユーザー名"
            className="input input-bordered w-full max-w-lg mt-2"
            name="nickname"
            defaultValue={paramsUser.nickname || ""}
          />
          <div>
            <textarea
              placeholder="自己紹介"
              className="textarea textarea-bordered w-full max-w-lg mt-2"
              name="bio"
              defaultValue={paramsUser.bio || ""}
            />
          </div>
          <button
            type="submit"
            className="btn btn-info w-full max-w-xs"
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
