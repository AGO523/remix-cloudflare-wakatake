import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckById } from "~/features/common/services/deck-data.server";
import { Badge } from "~/features/common/components/Badge";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  const { deckId } = params;

  const deck = await getDeckById(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  return json({ deck, user });
}

export default function DeckDetail() {
  const { deck, user } = useLoaderData<typeof loader>();
  const currentUserId = user?.id;

  // フィルタリングされた履歴を取得
  const visibleHistories = deck.histories.filter(
    (history) => history.status === "main" || deck.userId === currentUserId
  );

  const hasHiddenHistories = deck.histories.some(
    (history) => history.status !== "main" && deck.userId === currentUserId
  );

  return (
    <>
      <div className="p-4 mt-4 bg-base-100 flex justify-center">
        <div className="w-full max-w-3xl min-w-0 px-2">
          <h4 className="font-medium text-center">履歴</h4>

          <div className="grid grid-cols-1 gap-6 mb-4">
            {hasHiddenHistories && (
              <p className="text-error mt-4">
                非公開または下書きの履歴はあなたにだけ表示されています
              </p>
            )}
            {visibleHistories.map((history) => (
              <div key={history.id} className="shadow-lg rounded-lg p-4">
                <Link
                  to={`history/${history.id}`}
                  className="block"
                  preventScrollReset
                >
                  <Badge status={history.status} />
                  <p className="text-gray-700 text-left mt-2">
                    {history.content &&
                      (history.content.length > 50
                        ? history.content.substring(0, 50) + "..."
                        : history.content
                      )
                        .split("\n")
                        .map((line, index) => (
                          <span key={index}>
                            {line}
                            <br />
                          </span>
                        ))}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
