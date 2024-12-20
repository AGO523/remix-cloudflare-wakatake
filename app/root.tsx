import type {
  AppLoadContext,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { Header } from "./features/common/components/Header";
import LoadingIndicator from "./features/common/components/LoadingIndicator";
import artora_icon from "./images/artora-icon.png";
import { getToast } from "remix-toast";
import { useEffect } from "react";
import { ToastContainer, toast as notify } from "react-toastify";
import toastStyles from "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./firebase/AuthContext";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: toastStyles },
  {
    rel: "icon",
    href: artora_icon,
    type: "image/png",
  },
];

// 型定義をLoaderFunctionArgsに適用
export const loader = async ({
  context,
  request,
}: LoaderFunctionArgs & { context: AppLoadContext }) => {
  const { toast, headers } = await getToast(request);
  const env = context.env as Env;

  return json(
    {
      ENV: {
        FIREBASE_API_KEY: env.FIREBASE_API_KEY || "default-api-key",
        FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN || "default-auth-domain",
        FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID || "default-project-id",
        FIREBASE_STORAGE_BUCKET:
          env.FIREBASE_STORAGE_BUCKET || "default-storage-bucket",
        FIREBASE_MESSAGING_SENDER_ID:
          env.FIREBASE_MESSAGING_SENDER_ID || "default-messaging-sender-id",
        FIREBASE_APP_ID: env.FIREBASE_APP_ID || "default-app-id",
      },
      toast,
    },
    { headers }
  );
};

export default function App() {
  const navigation = useNavigation();
  const isTransitioning = navigation.state !== "idle";
  const { toast, ENV } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (toast) {
      notify(toast.message, { type: toast.type });
    }
  }, [toast]);

  return (
    <html lang="ja" data-theme="aqua">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {isTransitioning && <LoadingIndicator />}
        <AuthProvider>
          <Outlet />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(ENV)};`,
            }}
          />
        </AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
