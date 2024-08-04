import { Link } from "@remix-run/react";
import defaultDeckImage from "~/images/default_deck_image.png";
import { Deck } from "~/features/common/types/deck";

type DeckListProps = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  currentUserId?: number;
  userPageId?: number | null;
};

export function DeckList({ decks, currentUserId, userPageId }: DeckListProps) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">デッキ一覧</h1>
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
            <div
              key={deck.id}
              className="block shadow-lg rounded-lg p-2 hover:shadow-xl transition-shadow"
            >
              <Link to={`/pokemon/${deck.userId}/profile`} key={deck.userId}>
                <div className="flex items-center m-2">
                  {deck.avatarUrl ? (
                    <img
                      src={deck.avatarUrl}
                      alt="アバターの画像"
                      className="w-10 h-10 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full mr-2 bg-gray-300"></div>
                  )}
                  {deck.nickname ? (
                    <p className="badge badge-ghost mt-1">
                      作成者: {deck.nickname}
                    </p>
                  ) : (
                    <p className="badge badge-ghost mt-1">
                      作成者: ユーザー_{deck.userId}
                    </p>
                  )}
                </div>
              </Link>
              <Link
                to={
                  userPageId
                    ? `${deck.id}`
                    : `/pokemon/${deck.userId}/decks/${deck.id}`
                }
                key={deck.id}
              >
                <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
                <p className="text-gray-700 mb-4">{deck.description}</p>
                <div className="flex justify-center">
                  {mainDeckCode ? (
                    <img
                      src={mainDeckCode.imageUrl}
                      alt={deck.title}
                      className="object-cover rounded-md mb-4"
                    />
                  ) : (
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
            </div>
          );
        })}
      </div>
    </>
  );
}
