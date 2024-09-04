import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import {
  getDeckHistoryById,
  getDeckCodeByHistoryId,
  getDeck,
} from "~/features/common/services/deck-data.server";
import { Badge } from "~/features/common/components/Badge";
import { DeckBadge } from "~/features/common/components/DeckBadge";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);

  const { historyId, deckId } = params;

  const deck = await getDeck(Number(deckId), context);
  if (!deck) {
    throw new Response("Deck not found", { status: 404 });
  }
  const deckUserId = deck.userId;

  // デッキコードがある場合にはデッキコードを取得
  const deckHistory = await getDeckHistoryById(Number(historyId), context);
  const deckCode = await getDeckCodeByHistoryId(Number(historyId), context);
  if (!deckHistory) {
    throw new Response("Deck History not found", { status: 404 });
  }

  return json({ deckHistory, deckCode, user, deckUserId });
}

export default function DeckHistoryDetail() {
  const { deckHistory, deckCode, user, deckUserId } =
    useLoaderData<typeof loader>();
  const currentUserId = user?.id;

  return (
    <>
      <div className="pt-2 mt-4 bg-base-100 flex justify-center">
        <div className="w-full max-w-3xl min-w-0 px-2">
          <h1 className="text-3xl font-bold mb-6">デッキ履歴詳細</h1>
          <div className="rounded-lg shadow-lg p-6 mb-4">
            <Badge status={deckHistory.status} />

            {currentUserId && currentUserId === deckUserId && (
              <div className="flex justify-end mt-2 space-x-1">
                <Link
                  preventScrollReset
                  to="edit"
                  className="btn btn-sm btn-success"
                >
                  <svg
                    data-slot="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    ></path>
                  </svg>
                </Link>
                <Link
                  preventScrollReset
                  to="delete"
                  className="btn btn-sm btn-error btn-active"
                >
                  <svg
                    data-slot="icon"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    ></path>
                  </svg>
                </Link>
              </div>
            )}

            <div className="mt-2 mb-2 text-sm text-right">
              <p className="text-gray-700 mb-1">
                作成日:{" "}
                {deckHistory.createdAt
                  ? new Date(deckHistory.createdAt).toLocaleString()
                  : ""}
              </p>
              <p className="text-gray-700">
                更新日:{" "}
                {deckHistory.updatedAt
                  ? new Date(deckHistory.updatedAt).toLocaleString()
                  : ""}
              </p>
            </div>

            {deckCode && deckCode.imageUrl && (
              <>
                <div className="divider">デッキ画像</div>
                <div>
                  <DeckBadge status={deckCode.status} />
                  <img
                    src={deckCode.imageUrl}
                    alt="デッキの画像"
                    className="object-cover rounded-md mb-2 mt-2 max-h-[340px]"
                  />

                  {deckCode.imageUrl ===
                    "https://storage.googleapis.com/prod-artora-arts/images/sakusei2.png" && (
                    <>
                      <p className="text-gray-700 text-sm mb-2">
                        デッキ画像を作成するのに1分程度かかります
                      </p>

                      <Link
                        to="./"
                        className="btn btn-sm btn-info"
                        preventScrollReset
                      >
                        画像を更新
                      </Link>
                    </>
                  )}

                  <p className="text-gray-700 text-sm text-right mb-2">
                    デッキコード:{deckCode.code}
                  </p>
                </div>
              </>
            )}

            <div className="divider"></div>

            <div className="mt-6 mb-6">
              <p className="text-gray-700 text-left">
                {deckHistory.content?.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>

            {deckHistory.cardImageUrl && (
              <>
                <div className="divider">その他の画像</div>
                <div className="flex justify-center">
                  <img
                    src={deckHistory.cardImageUrl}
                    alt="添付画像"
                    className="object-cover rounded-md mb-4 max-w-[450px] max-h-[450px]"
                  />
                </div>
              </>
            )}
          </div>

          <Link
            to="../"
            className="btn w-full max-w-xs mt-2"
            preventScrollReset
          >
            戻る
          </Link>
        </div>
      </div>

      <div className="pt-8 mt-4 bg-base-200 flex justify-center">
        <div className="w-full max-w-3xl min-w-0 px-2">
          <Outlet />
        </div>
      </div>
    </>
  );
}
