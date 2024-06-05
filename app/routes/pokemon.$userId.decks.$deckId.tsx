import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
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
  const { deck, user } = useLoaderData<typeof loader>();
  const currentUserId = user.id;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{deck.title}</h1>
      <p className="text-gray-700 mb-4">
        {deck.description?.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <div className="flex justify-center">
        {deck.codes.length > 0 && deck.codes[0].status === "main" && (
          <img
            src={deck.codes[0].imageUrl}
            alt={deck.title}
            className="object-cover rounded-md mb-4"
          />
        )}
      </div>
      <div className="text-gray-600">
        {deck.userId === currentUserId && (
          <>
            <Link
              to="./"
              className="btn btn-primary btn-sm m-2"
              preventScrollReset
            >
              履歴一覧
            </Link>
            <Link
              to={`history_new`}
              className="btn btn-primary btn-sm m-2"
              preventScrollReset
            >
              履歴を作成
            </Link>
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
              削除
            </Link>
          </>
        )}
        <Link to="../" className="btn btn-secondary btn-sm">
          デッキ一覧へ
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
