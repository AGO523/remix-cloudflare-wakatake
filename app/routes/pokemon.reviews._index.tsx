import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getSingleCards } from "~/features/common/services/review.server";

type SingleCard = {
  id: number;
  imageUrl: string;
  name: string;
  type: string;
  rule?: string;
  gameType: string;
  createdAt: number;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const singleCards = await getSingleCards(context);
  return json({ singleCards });
}

export default function DecksByUser() {
  const { singleCards } = useLoaderData<{ singleCards: SingleCard[] }>();

  return (
    <>
      <div>
        <Link to={`cards`} className="btn mt-4">
          カード一覧へ
        </Link>
        <Link to={`pokepoke/cards`} className="btn mt-4">
          ポケポケのカード一覧
        </Link>
        <Link to={`new`} className="btn mt-4">
          新規作成
        </Link>
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold">レビュー一覧</h1>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {singleCards?.map((singleCard) => (
            <div
              key={singleCard.id}
              className="shadow-lg rounded-lg p-6 bg-base-200 max-w-3xl"
            >
              <div className="flex justify-between">
                <div>
                  <img
                    src={singleCard.imageUrl}
                    alt={singleCard.name}
                    className="w-24 h-24"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold">{singleCard.name}</p>
                  <p>{singleCard.type}</p>
                  <p>{singleCard.rule}</p>
                  <p>{singleCard.gameType}</p>
                  <p>{singleCard.createdAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
