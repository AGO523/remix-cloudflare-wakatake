import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "アートラ" },
    { name: "description", content: "アートラのポートフォリオ" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  ];
};

export default function PokemonLayout() {
  return (
    <>
      <section>
        <div className="container flex flex-col items-center px-4 py-16 pb-24 mx-auto text-center lg:pb-56 md:py-32 md:px-10 lg:px-32">
          <Outlet />
        </div>
      </section>

      <div className="p-6 sm:p-12 bg-neutral text-gray-100">
        <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-6 md:flex-row">
          <img
            src="https://storage.googleapis.com/prod-artora-arts/dev-images/artora-icon.png"
            alt="アートラのアイコン"
            className="self-center flex-shrink-0 w-24 h-24 border rounded-full md:justify-self-start dark:bg-secondary dark:border-gray-700"
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
