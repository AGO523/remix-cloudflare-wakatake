import { Form, useNavigation } from "@remix-run/react";
import { useRef } from "react";

export default function UploadImageForm({ userId }: { userId: number }) {
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
          className="btn btn-info m-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "画像をアップロード"}
        </button>
      </Form>
    </div>
  );
}
