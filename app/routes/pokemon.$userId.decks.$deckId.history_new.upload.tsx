import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import {
  getDeck,
  getUserBy,
  uploadAndCreateCardImage,
} from "~/features/common/services/deck-data.server";
import UploadImageForm from "~/features/common/components/UploadImageForm";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }
  return json({ deckUser });
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
  const { deckUser } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(deckUser.uid);

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div>
      <UploadImageForm userId={deckUser.id} />
    </div>
  );
}
