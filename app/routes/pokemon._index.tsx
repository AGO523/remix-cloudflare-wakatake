import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import {
  getDecks,
  getDeckCount,
} from "~/features/common/services/deck-data.server";
import { DeckList } from "~/features/common/components/DeckList";
import { Deck } from "~/features/common/types/deck";
import { parseDeckDates } from "~/features/common/utils/parseDates";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

type LoaderData = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  totalDecks: number;
  page: number;
};

export async function loader({ context, params }: LoaderFunctionArgs) {
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
    totalDecks,
    page,
  });
}

export default function PokemonDecks() {
  const { decks, totalDecks, page } = useLoaderData<LoaderData>();
  const { isAuthenticated } = useAuthGuard(undefined, false);
  // 暗号化した uid をキーにして、ユーザー固有のページ（デッキ作成、Profile）に遷移させる
  // 遷移先の loader で暗号化された uid を複合する
  // 複合に使う鍵は環境変数から？
  // 複合した uid を使用してDBから必要なデータを取得する
  // const cryptUid = user?.uid.split(":")[1];
  // // const currentUserId = user?.id;
  const totalPages = Math.ceil(totalDecks / 10);

  return (
    <>
      <div>
        <p className="text-5xl font-bold leading-tight pt-12 sm:text-6xl xl:max-w-3xl">
          Pokemon Card
        </p>
        <p className="mt-6 mb-8 text-lg sm:mb-12 xl:max-w-3xl">
          ポケモンカードのデッキ構築をサポートするアプリです。
          <br />
          デッキの変遷を記録し、共有することができます。
        </p>
      </div>

      <div className="flex flex-wrap justify-center mb-4">
        <Link to={`reviews`} className="btn btn-primary m-2">
          カード考察
        </Link>
        {isAuthenticated ? (
          <></>
        ) : (
          <Link to="/login" className="btn btn-info m-2">
            ログイン
          </Link>
        )}
      </div>

      <DeckList decks={decks} isAuthenticated={isAuthenticated} />

      <div className="flex justify-center mt-6 mb-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link
            key={pageNum}
            to={`/pokemon/decks?page=${pageNum}`}
            className={`btn ${
              page === pageNum ? "btn-info" : "btn-info"
            } btn-sm mx-1`}
          >
            {pageNum}
          </Link>
        ))}
      </div>
    </>
  );
}
