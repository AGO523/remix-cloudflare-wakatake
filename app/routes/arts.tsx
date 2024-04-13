import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getArtsWithImages } from "~/features/common/services/data.server";
import { ArtCard } from "~/features/common/components/ArtCard";

export async function loader({ context }: LoaderFunctionArgs) {
  const arts = await getArtsWithImages(context);
  return json({ arts });
}

export default function Admin() {
  const { arts } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col justify-center items-center">
      {arts ? (
        arts.map((art) => (
          <div key={art.id} className="m-2 w-full max-w-md mx-auto">
            <ArtCard
              art={{
                id: art.id,
                title: art.title,
                content: art.content,
                price: art.price,
                productUrl: art.productUrl || undefined,
              }}
              artImages={art.images || []}
              adminPath={false}
            />
          </div>
        ))
      ) : (
        <p>表示する作品がありません。</p>
      )}
    </div>
  );
}
