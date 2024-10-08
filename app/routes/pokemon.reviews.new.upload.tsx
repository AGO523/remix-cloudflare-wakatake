import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { jsonWithError, jsonWithSuccess, redirectWithError } from "remix-toast";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { uploadAndCreateCardImage } from "~/features/common/services/deck-data.server";
import UploadImageForm from "~/features/common/components/UploadImageForm";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  if (user.id !== 1) {
    return redirectWithError("/", "アクセス権限がありません");
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
  return (
    <div>
      <UploadImageForm userId={1} />
    </div>
  );
}
