import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDecksBy } from "~/features/common/services/deck-data.server";
import { DeckList } from "~/features/common/components/DeckList";
import { Deck } from "~/features/common/types/deck";
import { parseDeckDates } from "~/features/common/utils/parseDates";

type LoaderData = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  user: { id: number } | null;
  paramsUserId: number;
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  const paramsUserId = Number(params.userId);
  const decksData = await getDecksBy(paramsUserId, context);
  const decks = decksData.map((deck) => ({
    ...parseDeckDates(deck),
    nickname: deck.user ? deck.user.nickname || null : null,
    avatarUrl: deck.user ? deck.user.avatarUrl || null : null,
  }));

  return json<LoaderData>({ decks, user, paramsUserId });
}

export default function DecksByUser() {
  const { decks, user, paramsUserId } = useLoaderData<LoaderData>();
  const currentUserId = user?.id;

  return (
    <>
      <DeckList
        decks={decks}
        currentUserId={currentUserId}
        userPageId={paramsUserId}
      />
    </>
  );
}
