import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useParams,
  useNavigation,
} from "@remix-run/react";
import { useRef } from "react";
import { uploadAndCreateArtImage } from "~/features/common/services/data.server";

interface UploadImageActionData {
  success: boolean;
  message: string;
  imageUrl?: string;
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  return await uploadAndCreateArtImage(formData, context);
}

export default function UploadImage() {
  const actionData = useActionData<UploadImageActionData>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const artId = params.artId;
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
        <input type="hidden" name="artId" value={artId || ""} />
        <button
          type="submit"
          className="btn btn-info m-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "画像をアップロード"}
        </button>
      </Form>
      {actionData?.message && <p>{actionData.message}</p>}
    </div>
  );
}
