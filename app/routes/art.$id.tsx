import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useLocation } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import {
  getArtBy,
  getArtImagesBy,
} from "~/features/common/services/data.server";
import { ArtCard } from "~/features/common/components/ArtCard";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const artId = Number(params.id);
  const art = await getArtBy(artId, context);
  const artImages = await getArtImagesBy(artId, context);
  return json({ art, artImages });
}

export default function Art() {
  const { art, artImages } = useLoaderData<typeof loader>();
  const location = useLocation();
  const adminPath = location.pathname.includes("admin");

  return (
    <div className="flex justify-center items-center">
      {art ? (
        <ArtCard art={art} artImages={artImages} adminPath={adminPath} />
      ) : (
        <div>作品が見つかりませんでした。</div>
      )}
    </div>
  );
}
