import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckById } from "~/features/common/services/deck-data.server";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const { deckId } = params;
  if (!deckId) {
    throw new Response("Deck ID is required", { status: 400 });
  }
  const deck = await getDeckById(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  return json({ deck, user });
}

export default function DeckDetail() {
  const { deck } = useLoaderData<typeof loader>();
  const { user } = useLoaderData<typeof loader>();
  const currentUserId = user.id;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{deck.title}</h1>
      <p className="text-gray-700 mb-4">{deck.description}</p>
      {deck.images.length > 0 && (
        <img
          src={deck.images[0].imageUrl}
          alt={deck.title}
          className="object-cover rounded-md mb-4"
        />
      )}
      <div className="text-gray-600">
        {/* statusがmainを表示 */}
        {/* 下書き、非公開、限定公開 */}
        {/* 限定公開IDを作成する機能 */}
        <h4 className="font-medium">履歴</h4>
        {/* 履歴を作成する機能 */}
        {/* 履歴を更新する機能 */}
        {/* 履歴を削除する機能 */}
        <ul className="list-disc pl-5">
          {deck.histories.map((history) => (
            <li key={history.id}>
              <Link
                to={`/${currentUserId}/decks/${deck.id}/history/${history.id}`}
              >
                {history.status}: {history.content}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* デッキコードの更新機能 */}
      {/* デッキ削除機能 */}
    </div>
  );
}
