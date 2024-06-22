import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getCardImagesBy } from "~/features/common/services/deck-data.server";
import CardImages from "~/features/common/components/CardImages";
import { redirectWithError } from "remix-toast";

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userId = params;

  if (Number(userId) !== user.id) {
    return redirectWithError(
      `/pokemon/${userId}/decks`,
      "アクセス権限がありません"
    );
  }

  const cardImages = await getCardImagesBy(user.id, context);
  return json({ cardImages });
}

export default function EditDeckHistory() {
  const { cardImages } = useLoaderData<typeof loader>();

  return (
    <div>
      <CardImages cardImages={cardImages} />
    </div>
  );
}
