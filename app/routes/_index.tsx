import type { MetaFunction } from "@remix-run/cloudflare";
import hero_tora from "../images/hero_tora.jpg";
import inu from "../images/inu.jpg";
import kame from "../images/kame.jpg";
import neko from "../images/neko.jpg";
import mitumeru from "../images/mitumeru.jpg";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "アートラ" },
    { name: "description", content: "アートラのポートフォリオ" },
  ];
};

export default function Index() {
  return (
    <>
      <section>
        <div
          className="hero min-h-screen"
          style={{
            backgroundImage: `url(${hero_tora})`,
          }}
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="hero-content text-center text-neutral-content">
            <div className="max-w-md">
              <h1 className="mb-5 text-5xl font-bold">artora アートラ</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto flex flex-row items-center justify-center m-4">
        <div className="card card-compact w-96 bg-base-100 shadow-xl m-2">
          <figure>
            <img src={inu} alt="犬の作品" width={400} height={400} />
          </figure>
        </div>
        <div className="card card-compact w-96 bg-base-100 shadow-xl m-2">
          <figure>
            <img src={kame} alt="亀の作品" width={400} height={400} />
          </figure>
        </div>
      </section>
      <section className="container mx-auto flex flex-row items-center justify-center m-4">
        <div className="card card-compact w-96 bg-base-100 shadow-xl m-2">
          <figure>
            <img src={neko} alt="猫の作品" width={400} height={400} />
          </figure>
        </div>
        <div className="card card-compact w-96 bg-base-100 shadow-xl m-2">
          <figure>
            <img
              src={mitumeru}
              alt="犬が見つめる作品"
              width={400}
              height={400}
            />
          </figure>
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
