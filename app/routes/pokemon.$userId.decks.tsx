import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getDecksBy } from "~/features/common/services/data.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const decks = await getDecksBy(user.id, context);
  return json({ decks });
}

export default function DecksByUser() {
  const { decks } = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto p-4">
      <Link
        to="/pokemon/deck/new"
        className="btn btn-primary m-2"
        prefetch="intent"
      >
        デッキを登録する
      </Link>
      <h1 className="text-3xl font-bold mb-6">デッキ</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <div key={deck.id} className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
            <p className="text-gray-700 mb-4">{deck.description}</p>
            {deck.images.length > 0 && (
              <img
                src={deck.images[0].imageUrl}
                alt={deck.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <div className="text-gray-600">
              <h4 className="font-medium">履歴</h4>
              <ul className="list-disc pl-5">
                {deck.histories.map((history) => (
                  <li key={history.id}>
                    {history.status}: {history.content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
