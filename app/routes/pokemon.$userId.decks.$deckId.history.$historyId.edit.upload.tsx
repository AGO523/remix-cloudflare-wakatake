import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { jsonWithError, jsonWithSuccess, redirectWithError } from "remix-toast";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { uploadAndCreateCardImage } from "~/features/common/services/deck-data.server";
import UploadImageForm from "~/features/common/components/UploadImageForm";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { userId } = params;

  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  return json({ user });
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const response = await uploadAndCreateCardImage(formData, context);
  const responseData = await response.json();
  if (response.status === 201 || response.status === 200) {
    return jsonWithSuccess({}, responseData.message);
  } else {
    return jsonWithError({}, responseData.message);
  }
}

export default function UploadImage() {
  const { user } = useLoaderData<typeof loader>();
  const userId = user.id;

  return (
    <div>
      <UploadImageForm userId={userId} />
    </div>
  );
}
