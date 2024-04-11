import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import {
  getArtBy,
  getArtImagesBy,
} from "~/features/common/services/data.server";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const artId = Number(params.id);
  const art = await getArtBy(artId, context);
  const artImages = await getArtImagesBy(artId, context);
  return json({ art, artImages });
}

export default function Art() {
  const { art, artImages } = useLoaderData<typeof loader>();

  return (
    <>
      {art ? (
        <div className="card lg:card-side bg-base-100 shadow-xl">
          <figure>
            {artImages && artImages.length > 0 && (
              <img src={artImages[0].imageUrl} alt="Album" />
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title">{art.title}</h2>
            <p>{art.content}</p>
            <p>価格: {art.price} 円</p>
            <div className="card-actions justify-end">
              {art.productUrl && (
                <Link to={art.productUrl} className="btn btn-primary">
                  商品の販売ページへ
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>作品が見つかりませんでした。</div>
      )}
    </>
  );
}
