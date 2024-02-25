import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Image } from "@mantine/core";
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
      <Image src={hero_top1} />
      <Image src={hero_top2} />
      <Link to="#">Works</Link>
      <Link to="/login">Login</Link>
      <Link to="/admin">Admin</Link>
    </>
  );
}
