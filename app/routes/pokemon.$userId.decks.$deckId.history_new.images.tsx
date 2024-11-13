import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import {
  getCardImagesBy,
  getDeck,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import CardImages from "~/features/common/components/CardImages";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { deckId } = params;
  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }

  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }

  const cardImages = await getCardImagesBy(deckUser.id, context);
  return json({ cardImages, deckUser });
}

export default function NewDeckHistory() {
  const { cardImages, deckUser } = useLoaderData<typeof loader>();
  const { loading } = useAuthGuard(deckUser.uid);

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div>
      <CardImages cardImages={cardImages} />
    </div>
  );
}
