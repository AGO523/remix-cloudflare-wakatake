import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { Header } from "./features/common/components/Header";
import LoadingIndicator from "./features/common/components/LoadingIndicator";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  const navigation = useNavigation();
  const isTransitioning = navigation.state !== "idle";

  return (
    <html lang="ja" data-theme="retro">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {isTransitioning && <LoadingIndicator />}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
