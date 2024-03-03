import type { MetaFunction } from "@remix-run/cloudflare";
import hero_tora from "../images/hero_tora.jpg";
import yagi_neko from "../images/yagi_neko.jpg";
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

      <section>
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content flex-col lg:flex-row">
            <img
              src={yagi_neko}
              alt="ヤギと猫の作品"
              className="max-w-sm rounded-lg shadow-2xl"
            />
            <div>
              <p className="mb-5">
                動物たちに会うたびに、ただの人間と動物の関係ではなく、一つ一つの存在としての会話を感じます。
              </p>
              <p className="mb-5">
                犬や猫など、特定の種類にとらわれず、この世界で唯一無二の生命として接しています。
              </p>
              <p className="mb-5">
                このようにして、動物や自然の作品を彫り続けたいと思っています。
                もっと多くの人に、大切な命の存在を知ってほしい。そのための仕事をこれからもやっていきたいです。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto flex flex-row items-center justify-center mt-4">
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
          <figure>
            <img src={inu} alt="犬の作品" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">犬の作品</h2>
            <p>犬の作品です。</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">詳細を見る</button>
            </div>
          </div>
        </div>
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
          <figure>
            <img src={kame} alt="亀の作品" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">亀の作品</h2>
            <p>亀の作品です。</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">詳細を見る</button>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto flex flex-row items-center justify-center mt-4">
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
          <figure>
            <img src={neko} alt="猫の作品" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">猫の作品</h2>
            <p>猫の作品です。</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">詳細を見る</button>
            </div>
          </div>
        </div>
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
          <figure>
            <img src={mitumeru} alt="犬が見つめる作品" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">犬が見つめる作品</h2>
            <p>犬が見つめる作品です。</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">詳細を見る</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
