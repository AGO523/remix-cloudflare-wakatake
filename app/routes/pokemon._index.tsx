import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDecks,
  getDeckCount,
} from "~/features/common/services/deck-data.server";
import { DeckList } from "~/features/common/components/DeckList";
import { Deck } from "~/features/common/types/deck";
import { parseDeckDates } from "~/features/common/utils/parseDates";

type LoaderData = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  user: { id: number } | null;
  totalDecks: number;
  page: number;
};

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  const page = params.page ? Number(params.page) : 1;
  const decksData = await getDecks(context, page, 10);
  const totalDecks = await getDeckCount(context);
  if (!decksData) {
    throw new Response("Decks not found", { status: 404 });
  }
  const decks = decksData.map((deck) => ({
    ...parseDeckDates(deck),
    nickname: deck.user ? deck.user.nickname || null : null,
    avatarUrl: deck.user ? deck.user.avatarUrl || null : null,
  }));

  return json<LoaderData>({
    decks,
    user,
    totalDecks,
    page,
  });
}

export default function PokemonDecks() {
  const { decks, user, totalDecks, page } = useLoaderData<LoaderData>();
  const currentUserId = user?.id;
  const totalPages = Math.ceil(totalDecks / 10);

  return (
    <>
      <p className="text-5xl font-bold leading-tight pt-12 sm:text-6xl xl:max-w-3xl">
        Pokemon Card
      </p>
      <p className="mt-6 mb-8 text-lg sm:mb-12 xl:max-w-3xl">
        ポケモンカードのデッキ構築をサポートするアプリです。
        <br />
        デッキの変遷を記録し、共有することができます。
      </p>
      <div className="flex flex-wrap justify-center mb-4">
        {currentUserId ? (
          <>
            <Link
              to={`${currentUserId}/decks/new`}
              className="btn btn-primary m-2"
            >
              デッキを登録する
            </Link>
            <Link
              to={`${currentUserId}/decks`}
              className="btn btn-accent m-2"
              prefetch="intent"
            >
              自分のデッキを見る
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary m-2">
            ログイン
          </Link>
        )}
      </div>

      <DeckList decks={decks} currentUserId={currentUserId} />

      <div className="flex justify-center mt-6 mb-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link
            key={pageNum}
            to={`/pokemon/decks?page=${pageNum}`}
            className={`btn ${
              page === pageNum ? "btn-primary" : "btn-info"
            } btn-sm mx-1`}
          >
            {pageNum}
          </Link>
        ))}
      </div>
    </>
  );
}
