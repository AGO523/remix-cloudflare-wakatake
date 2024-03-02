import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import hero_top1 from "../images/hero_top1.jpg";
import hero_top2 from "../images/hero_top2.jpg";

export const meta: MetaFunction = () => {
  return [
    { title: "アートラ" },
    { name: "description", content: "アートラのポートフォリオ" },
  ];
};

export default function Index() {
  return (
    <>
      <div className="card card-compact w-96 bg-base-100 shadow-xl">
        <figure>
          <img src={hero_top1} alt="Shoes" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>

      <div className="card card-compact w-96 bg-base-100 shadow-xl">
        <figure>
          <img src={hero_top2} alt="Shoes" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>

      <Link to="#">
        <button className="btn btn-primary">Works</button>
      </Link>
      <Link to="/login">
        <button className="btn btn-primary">Login</button>
      </Link>
      <Link to="/admin">
        <button className="btn btn-primary">Admin</button>
      </Link>
      <Link to="/logout">
        <button className="btn btn-primary">Logout</button>
      </Link>
    </>
  );
}
