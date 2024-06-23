import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDecksBy } from "~/features/common/services/deck-data.server";
import defaultDeckImage from "~/images/default_deck_image.png";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  const paramsUserId = Number(params.userId);
  const decks = await getDecksBy(paramsUserId, context);
  return json({ decks, user, paramsUserId });
}

export default function DecksByUser() {
  const { decks, user, paramsUserId } = useLoaderData<typeof loader>();
  const currentUserId = user?.id;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">デッキ</h1>
      {currentUserId === paramsUserId && (
        <Link to="new" className="btn btn-primary btn-sm m-1" prefetch="intent">
          デッキを新規作成
        </Link>
      )}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {decks.length === 0 && (
          <p className="text-gray-700">
            このユーザーのデッキはまだ登録されていません。
          </p>
        )}
        {decks.map((deck) => {
          const mainDeckCode = deck.codes.find(
            (code) => code.status === "main"
          );
          return (
            <Link
              to={`${deck.id}`}
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
      <div className="btn btn-error mt-8">
        <Link to="/auth/logout">ログアウト</Link>
      </div>
    </>
  );
}
