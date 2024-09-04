import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useEffect, useRef } from "react";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDeckById } from "~/features/common/services/deck-data.server";
import defaultDeckImage from "~/images/sakusei2.png";

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
  const mainDeckCode = deck.codes.find((code) => code.status === "main");
  const isDeckCodeWithDefaultImage = deck.codes.find(
    (code) =>
      code.imageUrl ===
      "https://storage.googleapis.com/prod-artora-arts/images/sakusei2.png"
  );

  const outletRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname.endsWith("history_new") ||
      (!location.pathname.includes("history") &&
        (location.pathname.endsWith("edit") ||
          location.pathname.endsWith("delete") ||
          location.pathname.endsWith("codes")))
    ) {
      outletRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, location.search]);

  return (
    <>
      <div className="p-4 bg-base-200 flex justify-center items-center">
        <div className="w-full max-w-3xl min-w-0 px-2">
          <div className="flex justify-center items-center relative">
            <h1 className="text-3xl font-bold text-center">{deck.title}</h1>
          </div>
          {deck.userId === currentUserId && (
            <div className="flex justify-end mt-2 space-x-2">
              <Link to={`edit`} className="btn btn-sm btn-success">
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
              <Link to={`delete`} className="btn btn-sm btn-error btn-active">
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

          {deck.description &&
            deck.description.split("\n").map((line, index) => (
              <div key={index} className="text-gray-700 mb-4">
                <span>
                  {line}
                  <br />
                </span>
              </div>
            ))}

          <div className="flex justify-center">
            {(deck.codes.length > 0 && mainDeckCode && (
              <div>
                <p className="text-gray-600">
                  デッキコード: {mainDeckCode?.code}
                </p>
                <img
                  src={mainDeckCode.imageUrl}
                  alt={deck.title}
                  className="object-cover rounded-md max-h-[340px]"
                />
              </div>
            )) || (
              <div className="flex justify-center items-center">
                <img
                  src={defaultDeckImage}
                  alt={deck.title}
                  className="object-cover max-h-[340px]"
                />
              </div>
            )}
          </div>

          {/* pubsub で作成中に出す */}
          {mainDeckCode &&
            mainDeckCode.imageUrl ===
              "https://storage.googleapis.com/prod-artora-arts/images/sakusei2.png" && (
              <>
                <p className="text-error text-sm mb-2">
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

          {/* main がない場合に設定を促す */}
          {mainDeckCode === undefined &&
            isDeckCodeWithDefaultImage === undefined && (
              <>
                <p className="text-error text-sm mb-2">
                  メインとして表示する画像が設定されていません
                </p>
                <Link to={`codes`} className="btn btn-sm btn-info">
                  メイン画像を設定する
                </Link>
              </>
            )}

          {deck.userId === currentUserId && (
            <div className="mt-4">
              <Link to={`history_new`} className="btn btn-primary">
                履歴を作成する
              </Link>
            </div>
          )}

          {/* フローティング */}
          <div className="fixed right-2 bottom-14">
            <ul className="menu bg-base-100 bg-opacity-60 rounded-box shadow-lg flex flex-col space-y-1">
              <li>
                <Link to="./" className="btn btn-sm btn-info bg-opacity-60">
                  履歴一覧
                </Link>
              </li>
              {deck.userId === currentUserId && (
                <>
                  <li>
                    <Link
                      to={`codes`}
                      className="btn btn-sm btn-info bg-opacity-60"
                    >
                      デッキコード一覧
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div ref={outletRef}>
        <Outlet />
      </div>
    </>
  );
}
