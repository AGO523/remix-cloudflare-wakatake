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
  decks: Deck[];
  user: { id: number } | null;
  totalDecks: number;
  page: number;
  nickname: string | null;
  avatarUrl: string | null;
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
  const decks = decksData.map(parseDeckDates) as Deck[]; // 型アサーション

  let nickname = null;
  let avatarUrl = null;
  if (decksData.length > 0 && decksData[0].user) {
    nickname = decksData[0].user.nickname || null;
    avatarUrl = decksData[0].user.avatarUrl || null;
  }

  return json<LoaderData>({
    decks,
    user,
    totalDecks,
    page,
    nickname,
    avatarUrl,
  });
}

export default function PokemonDecks() {
  const { decks, user, totalDecks, page, nickname, avatarUrl } =
    useLoaderData<LoaderData>();
  const currentUserId = user?.id;
  const totalPages = Math.ceil(totalDecks / 10);

  return (
    <>
      <p className="text-5xl font-bold leadi pt-12 sm:text-6xl xl:max-w-3xl">
        pokemon card
      </p>
      <p className="mt-6 mb-8 text-lg sm:mb-12 xl:max-w-3xl">
        ポケモンカードのデッキ構築をサポートするアプリです。
        <br />
        デッキの変遷を記録し、共有することができます。
      </p>
      <div className="flex flex-wrap justify-center mb-8">
        {(currentUserId && (
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
        )) || (
          <Link to="/login" className="btn btn-primary m-2">
            ログイン
          </Link>
        )}
      </div>

      <div className="divider"></div>

      <DeckList
        decks={decks}
        currentUserId={currentUserId}
        userPageId={null}
        userNickname={nickname}
        userAvatarUrl={avatarUrl}
      />
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link
            key={pageNum}
            to={`/pokemon/decks?page=${pageNum}`}
            className={`btn ${
              page === pageNum ? "btn-primary" : "btn-secondary"
            } btn-sm mx-1`}
          >
            {pageNum}
          </Link>
        ))}
      </div>
    </>
  );
}
