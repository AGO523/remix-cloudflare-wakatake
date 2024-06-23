import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDecks,
  getDeckCount,
} from "~/features/common/services/deck-data.server";
import defaultDeckImage from "~/images/default_deck_image.png";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  const page = params.page ? Number(params.page) : 1;
  const decks = await getDecks(context, page, 10);
  const totalDecks = await getDeckCount(context);
  if (!decks) {
    throw new Response("Decks not found", { status: 404 });
  }
  return json({ decks, user, totalDecks, page });
}

export default function Decks() {
  const { decks, user, totalDecks, page } = useLoaderData<typeof loader>();
  const currentUserId = user?.id;
  const totalPages = Math.ceil(totalDecks / 10);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">デッキ</h1>
      {currentUserId && (
        <Link
          to={`/pokemon/${currentUserId}/decks/new`}
          className="btn btn-primary btn-sm m-1"
          prefetch="intent"
        >
          デッキを新規作成
        </Link>
      )}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {decks.length === 0 && (
          <p className="text-gray-700">まだデッキが登録されていません。</p>
        )}
        {decks.map((deck) => {
          const mainDeckCode = deck.codes.find(
            (code) => code.status === "main"
          );
          return (
            <Link
              to={`/pokemon/${deck.userId}/decks/${deck.id}`}
              key={deck.id}
              className="block shadow-lg rounded-lg p-2 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
              <p className="text-gray-700 mb-4">{deck.description}</p>
              <div className="flex justify-center">
                {(deck.codes.length > 0 && mainDeckCode && (
                  <img
                    src={mainDeckCode.imageUrl}
                    alt={deck.title}
                    className="object-cover rounded-md mb-4"
                  />
                )) || (
                  <div>
                    <img
                      src={defaultDeckImage}
                      alt={deck.title}
                      className="object-cover rounded-md mb-2"
                    />
                    <p className="text-sm text-gray-500 mb-2">
                      メインのデッキ画像がないため、デフォルトのデッキ画像を表示しています
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
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
