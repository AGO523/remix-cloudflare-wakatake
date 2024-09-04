import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getCardImagesBy,
  getDeck,
} from "~/features/common/services/deck-data.server";
import CardImages from "~/features/common/components/CardImages";
import { redirectWithError } from "remix-toast";

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  const deckUserId = deck.userId;

  if (deckUserId !== currentUser.id) {
    return redirectWithError(`/pokemon`, "アクセス権限がありません");
  }

  const cardImages = await getCardImagesBy(currentUser.id, context);
  return json({ cardImages });
}

export default function NewDeckHistory() {
  const { cardImages } = useLoaderData<typeof loader>();

  return (
    <div>
      <CardImages cardImages={cardImages} />
    </div>
  );
}
