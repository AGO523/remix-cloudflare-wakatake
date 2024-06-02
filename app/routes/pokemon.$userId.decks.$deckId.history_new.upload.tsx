import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useNavigation, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { uploadAndCreateCardImage } from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  return json({ user });
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const response = await uploadAndCreateCardImage(formData, context);
  const responseData = await response.json();
  if (response.status === 201 || response.status === 200) {
    return redirectWithSuccess(`./`, responseData.message);
  }
  return redirectWithError(`./`, responseData.message);
}

export default function UploadImage() {
  const { user } = useLoaderData<typeof loader>();
  const userId = user.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div>
      <Form method="post" encType="multipart/form-data">
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          accept="image/*"
        />
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="btn btn-primary m-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "画像をアップロード"}
        </button>
      </Form>
    </div>
  );
}
