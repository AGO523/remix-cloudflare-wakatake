import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useParams } from "@remix-run/react"; // useSearchParamsをuseParamsに変更
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
        <button type="submit" className="btn m-2">
          画像をアップロード
        </button>
      </Form>
      {actionData?.message && <p>{actionData.message}</p>}
    </div>
  );
}
