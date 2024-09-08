import { Link } from "@remix-run/react";
import defaultDeckImage from "~/images/sakusei2.png";
import { Deck } from "~/features/common/types/deck";
import { UserIcon } from "~/features/common/components/UserIcon";

type DeckListProps = {
  decks: (Deck & { nickname: string | null; avatarUrl: string | null })[];
  currentUserId?: number;
  userPageId?: number | null;
};

export function DeckList({ decks, currentUserId, userPageId }: DeckListProps) {
  return (
    <>
      {/* フローティング */}
      {currentUserId && (
        <Link
          to="new"
          className="btn btn-info fixed bottom-20 right-6 m-1"
          prefetch="intent"
        >
          デッキ作成
        </Link>
      )}

      <div className="p-4 bg-base-200 flex justify-center">
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
                className="block shadow-lg rounded-lg p-2 hover:shadow-xl transition-shadow bg-base-100"
              >
                <UserIcon
                  userId={deck.id}
                  avatarUrl={deck.avatarUrl}
                  nickname={deck.nickname}
                />

                <Link
                  to={
                    userPageId
                      ? `${deck.id}`
                      : `/pokemon/${deck.userId}/decks/${deck.id}`
                  }
                  key={deck.id}
                  unstable_viewTransition
                >
                  <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
                  <p className="text-gray-700 mb-4">{deck.description}</p>
                  <div className="flex justify-center items-center">
                    {mainDeckCode ? (
                      <img
                        src={mainDeckCode.imageUrl}
                        alt={deck.title}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src={defaultDeckImage}
                        alt={deck.title}
                        className="object-cover max-h-[340px]"
                      />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
