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
  if (decksData.length > 0 && decksData[0].user) {
    nickname = decksData[0].user.nickname || null;
  }

  return json<LoaderData>({ decks, user, totalDecks, page, nickname });
}

export default function Decks() {
  const { decks, user, totalDecks, page, nickname } =
    useLoaderData<LoaderData>();
  const currentUserId = user?.id;
  const totalPages = Math.ceil(totalDecks / 10);

  return (
    <>
      <DeckList
        decks={decks}
        currentUserId={currentUserId}
        userPageId={null}
        userNickname={nickname}
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
