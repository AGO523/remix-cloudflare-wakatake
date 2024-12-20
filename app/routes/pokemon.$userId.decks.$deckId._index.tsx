import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import {
  getDeckById,
  getUserBy,
} from "~/features/common/services/deck-data.server";
import { Badge } from "~/features/common/components/Badge";
import { UserIcon } from "~/features/common/components/UserIcon";
import useAuthGuard from "~/features/common/hooks/useAuthGuard";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { deckId } = params;

  const deck = await getDeckById(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }

  const deckUser = await getUserBy(deck.userId, context);
  if (!deckUser) {
    throw new Response("Deck user not found", { status: 404 });
  }
  return json({ deck, deckUser });
}

export default function DeckDetail() {
  const { deck, deckUser } = useLoaderData<typeof loader>();
  const { user } = useAuthGuard(deckUser.uid, false);

  const currentUserUid = user?.uid;

  // フィルタリングされた履歴を取得
  const visibleHistories = deck.histories.filter(
    (history) => history.status === "main" || deckUser.uid === currentUserUid
  );

  // これは直すかも？
  const hasHiddenHistories = deck.histories.some(
    (history) => history.status !== "main" && deckUser.uid === currentUserUid
  );

  return (
    <>
      <div className="p-4 mt-4 bg-base-100 flex justify-center">
        <div className="w-full max-w-3xl min-w-0 px-2">
          <h1 className="text-3xl font-bold mb-6">履歴</h1>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {hasHiddenHistories && (
              <p className="text-error mt-4">
                非公開/下書きの履歴はあなたにだけ表示されています
              </p>
            )}

            {/* 詳細と同じ見た目にする */}
            {visibleHistories.map((history) => (
              <div
                key={history.id}
                className="shadow-lg rounded-lg p-6 bg-base-200 max-w-3xl"
              >
                <div className="mb-1">
                  <UserIcon
                    userId={deckUser.id}
                    avatarUrl={deckUser.avatarUrl}
                    nickname={deckUser.nickname}
                  />
                </div>

                <Link
                  to={`history/${history.id}`}
                  className="block"
                  preventScrollReset
                >
                  <Badge status={history.status} />
                  <p className="text-base-content text-left mt-2">
                    {history.content &&
                      (history.content.length > 200
                        ? history.content.substring(0, 200) + "..."
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
