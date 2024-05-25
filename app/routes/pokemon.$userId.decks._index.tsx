import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDecksBy } from "~/features/common/services/deck-data.server";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userId = Number(params.userId);
  const decks = await getDecksBy(userId, context);
  return json({ decks, user });
}

export default function DecksByUser() {
  const { decks } = useLoaderData<typeof loader>();

  return (
    <>
      <Link
        to="/pokemon/deck/new"
        className="btn btn-primary m-2"
        prefetch="intent"
      >
        デッキを登録する
      </Link>
      <h1 className="text-3xl font-bold mb-6">デッキ</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {decks.map((deck) => (
          <Link
            to={`${deck.id}`}
            key={deck.id}
            className="block bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
            <p className="text-gray-700 mb-4">{deck.description}</p>
            {deck.images.length > 0 && (
              <img
                src={deck.images[0].imageUrl}
                alt={deck.title}
                className="object-cover rounded-md mb-4"
              />
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
