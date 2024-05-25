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
  const { deck, user } = useLoaderData<typeof loader>();
  const currentUserId = user.id;

  // フィルタリングされた履歴を取得
  const visibleHistories = deck.histories.filter(
    (history) => history.status === "main" || deck.userId === currentUserId
  );

  const hasHiddenHistories = deck.histories.some(
    (history) => history.status !== "main" && deck.userId === currentUserId
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{deck.title}</h1>
      <p className="text-gray-700 mb-4">{deck.description}</p>
      <div className="m-4 flex justify-center">
        {deck.images.length > 0 && (
          <img
            src={deck.images[0].imageUrl}
            alt={deck.title}
            className="object-cover rounded-md mb-4"
          />
        )}
      </div>
      <div className="text-gray-600">
        <h4 className="font-medium">履歴</h4>
        <div className="grid grid-cols-1 gap-6">
          {visibleHistories.map((history) => (
            <div key={history.id} className="shadow-lg rounded-lg p-4">
              <Link to={`history/${history.id}`} className="block">
                <h5 className="text-xl font-semibold mb-2">
                  {history.status === "main" && "公開"}
                  {history.status === "sub" && "非公開"}
                  {history.status === "draft" && "下書き"}
                </h5>
                <p className="text-gray-700">{history.content}</p>
              </Link>
            </div>
          ))}
        </div>
        {hasHiddenHistories && (
          <p className="text-error mt-4">
            非公開または下書きの履歴は表示されていません。
          </p>
        )}
        {deck.userId === currentUserId && (
          <>
            <Link to={`history/new`} className="btn btn-primary m-2">
              履歴を作成
            </Link>
            <Link to={`edit`} className="btn btn-primary m-2">
              デッキ情報の更新
            </Link>
            <Link to={`delete`} className="btn btn-error m-2">
              削除
            </Link>
          </>
        )}
      </div>
      <div>
        <Link to="../" className="btn btn-primary">
          デッキ一覧へ
        </Link>
      </div>
    </>
  );
}
