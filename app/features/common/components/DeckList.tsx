import { Link } from "@remix-run/react";
import defaultDeckImage from "~/images/default_deck_image.png";
import { Deck } from "~/features/common/types/deck";

type DeckListProps = {
  decks: Deck[];
  currentUserId?: number;
  userPageId?: number | null;
  userNickname?: string | null; // プロパティ名の修正
};

export function DeckList({
  decks,
  currentUserId,
  userPageId,
  userNickname,
}: DeckListProps) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">デッキ</h1>
      {currentUserId === userPageId && (
        <Link to="new" className="btn btn-primary m-1" prefetch="intent">
          デッキを新規作成
        </Link>
      )}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {decks.length === 0 && (
          <p className="text-gray-700">
            {userPageId
              ? "このユーザーのデッキはまだ登録されていません。"
              : "まだデッキが登録されていません。"}
          </p>
        )}
        {decks.map((deck) => {
          const mainDeckCode = deck.codes.find(
            (code) => code.status === "main"
          );
          return (
            <Link
              to={
                userPageId
                  ? `${deck.id}`
                  : `/pokemon/${deck.userId}/decks/${deck.id}`
              }
              key={deck.id}
              className="block shadow-lg rounded-lg p-2 hover:shadow-xl transition-shadow"
            >
              {userNickname && (
                <div className="badge badge-ghost mb-1">
                  作成者: {userNickname}
                </div>
              )}

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
    </>
  );
}
