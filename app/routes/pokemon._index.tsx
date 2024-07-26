import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { Link, useLoaderData } from "@remix-run/react";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request);
  return { user };
}

export default function PokemonDecks() {
  const { user } = useLoaderData<typeof loader>();
  const currentUserId = user?.id;

  return (
    <>
      <p className="text-5xl font-bold leadi sm:text-6xl xl:max-w-3xl">
        pokemon card
      </p>
      <p className="mt-6 mb-8 text-lg sm:mb-12 xl:max-w-3xl">
        ポケモンカードのデッキ構築をサポートするアプリです。
        <br />
        デッキの変遷を記録し、共有することができます。
      </p>
      <div className="flex flex-wrap justify-center">
        {(currentUserId && (
          <>
            <Link
              to={`${currentUserId}/decks/new`}
              className="btn btn-primary m-2"
            >
              デッキを登録する
            </Link>
            <Link
              to={`${currentUserId}/decks`}
              className="btn btn-accent m-2"
              prefetch="intent"
            >
              自分のデッキを見る
            </Link>
          </>
        )) || (
          <Link to="/login" className="btn btn-primary m-2">
            ログイン
          </Link>
        )}
        <Link to="decks" className="btn btn-secondary m-2" prefetch="intent">
          みんなのデッキを見る
        </Link>
      </div>
    </>
  );
}
