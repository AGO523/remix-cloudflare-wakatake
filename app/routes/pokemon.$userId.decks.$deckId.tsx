import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckById } from "~/features/common/services/deck-data.server";
import defaultDeckImage from "~/images/default_deck_image.png";

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
  const { deck, user } = useLoaderData<typeof loader>();
  const currentUserId = user.id;
  const mainDeckCode = deck.codes.find((code) => code.status === "main");

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{deck.title}</h1>
      <span className="text-gray-600">デッキの概要</span>
      <p className="text-gray-700 mb-4">
        {deck.description?.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
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
      <div className="text-gray-600">
        {deck.userId === currentUserId && (
          <>
            <Link
              to={`edit`}
              className="btn btn-primary btn-sm m-2"
              preventScrollReset
            >
              デッキ情報の更新
            </Link>
            <Link
              to={`delete`}
              className="btn btn-error btn-sm m-2"
              preventScrollReset
            >
              デッキの削除
            </Link>
          </>
        )}
      </div>
      <div className="text-gray-600">
        <Link to="./" className="btn btn-primary btn-sm m-2" preventScrollReset>
          履歴一覧
        </Link>
        {deck.userId === currentUserId && (
          <>
            <Link
              to={`history_new`}
              className="btn btn-primary btn-sm m-2"
              preventScrollReset
            >
              履歴を作成
            </Link>
          </>
        )}
      </div>
      <Outlet />
    </div>
  );
}
