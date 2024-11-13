import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getDecksBy } from "~/features/common/services/deck-data.server";
import { DeckList } from "~/features/common/components/DeckList";
import { Deck } from "~/features/common/types/deck";
import { parseDeckDates } from "~/features/common/utils/parseDates";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

type LoaderData = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  paramsUserId: number;
};

export async function loader({ context, params }: LoaderFunctionArgs) {
  const paramsUserId = Number(params.userId);
  const decksData = await getDecksBy(paramsUserId, context);
  const decks = decksData.map((deck) => ({
    ...parseDeckDates(deck),
    nickname: deck.user ? deck.user.nickname || null : null,
    avatarUrl: deck.user ? deck.user.avatarUrl || null : null,
  }));

  return json<LoaderData>({ decks, paramsUserId });
}

export default function DecksByUser() {
  const { decks, paramsUserId } = useLoaderData<LoaderData>();
  const { isAuthenticated } = useAuthGuard();

  return (
    <>
      <DeckList
        decks={decks}
        isAuthenticated={isAuthenticated}
        userPageId={paramsUserId}
      />
    </>
  );
}
