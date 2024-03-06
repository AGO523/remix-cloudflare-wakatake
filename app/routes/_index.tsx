import type { MetaFunction } from "@remix-run/cloudflare";
import hero_tora from "../images/hero_tora.jpg";
import inu from "../images/inu.jpg";
import kame from "../images/kame.jpg";
import neko from "../images/neko.jpg";
import mitumeru from "../images/mitumeru.jpg";

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
    </>
  );
}
