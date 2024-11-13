import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import hero_tora from "../images/hero_tora.jpg";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import { getArtsWithImages } from "~/features/common/services/data.server";

export const meta: MetaFunction = () => {
  return [
    { title: "アートラ" },
    { name: "description", content: "アートラのポートフォリオ" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const arts = await getArtsWithImages(context);
  return json({ arts });
}

export default function Index() {
  const { arts } = useLoaderData<typeof loader>();

  return (
    <>
      <section>
        <div className="container flex flex-col items-center px-4 py-16 pb-24 mx-auto text-center lg:pb-56 md:py-32 md:px-10 lg:px-32">
          <p className="text-5xl font-bold leadi sm:text-6xl xl:max-w-3xl">
            artora
          </p>
          <p className="mt-6 mb-8 text-lg sm:mb-12 xl:max-w-3xl">
            アートラはポートフォリオサイトです。
            <br />
            作品の閲覧、購入などができます。
          </p>
          <div className="flex flex-wrap justify-center">
            <Link to="/arts" className="btn btn-info m-2" prefetch="intent">
              作品を見る
            </Link>
            <Link
              to="https://www.instagram.com/kajisac_art/"
              className="btn btn-secondary m-2"
              target="_blank"
              rel="noreferrer"
            >
              SNSを見る
            </Link>
            <Link
              to="/dialies"
              className="btn btn-accent m-2"
              prefetch="intent"
            >
              護主印日記
            </Link>
          </div>
        </div>

        <img
          src={hero_tora}
          alt="hero"
          className="w-5/6 mx-auto mb-12 -mt-20 rounded-lg shadow-md lg:-mt-40"
        />
      </section>

      <section className="container mx-auto flex flex-row items-center justify-center">
        <section className="py-6">
          <div className="container flex flex-col justify-center p-4 mx-auto">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 sm:grid-cols-2">
              {arts ? (
                arts.map((art) => (
                  <div key={art.id}>
                    <Link to={`/art/${art.id}`}>
                      {art.images && art.images.length > 0 && (
                        <figure>
                          <img
                            key={art.images[0].id}
                            src={art.images[0].imageUrl}
                            alt="作品の画像"
                            className="rounded-lg m-1 shadow-xl"
                          />
                        </figure>
                      )}
                      <span className="badge badge-lg">{art.title}</span>
                    </Link>
                  </div>
                ))
              ) : (
                <p>作品がありません</p>
              )}
            </div>
          </div>
        </section>
      </section>

      <div className="p-6 sm:p-12 bg-neutral text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src="https://storage.googleapis.com/prod-artora-arts/dev-images/artora-icon.png"
            alt="アートラのアイコン"
            className="self-center flex-shrink-0 w-24 h-24 border rounded-full md:justify-self-start dark:bg-secondary dark:border-base-content"
          />
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-center md:text-left">
              アートラ
            </h4>
            <p className="dark:text-gray-400">
              アートラのポートフォリオサイトです。仕事の依頼や作品に関する問い合わせはSNSからお願いします。
            </p>
          </div>
        </div>
        <div className="flex justify-center pt-4 space-x-4 align-center">
          <Link rel="noopener noreferrer" to="#" aria-label="Twitter">
            <img
              src="https://storage.googleapis.com/prod-artora-arts/dev-images/twitter.png"
              alt="Twitter"
              width={24}
              height={24}
              className="pt-1"
            />
          </Link>
          <Link
            rel="noopener noreferrer"
            to="https://www.instagram.com/kajisac_art/"
            aria-label="Instagram"
            target="_blank"
          >
            <img
              src="https://storage.googleapis.com/prod-artora-arts/dev-images/instagram_color.png"
              alt="Instagram"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </div>
    </>
  );
}
