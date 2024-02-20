import { onRequest as ____path___js_onRequest } from "/Users/ago/Documents/remix-cloudflare-wakatake/functions/[[path]].js"

export const routes = [
    {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___js_onRequest],
    },
  ]