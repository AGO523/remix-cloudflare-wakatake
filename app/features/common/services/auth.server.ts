import type { AppLoadContext } from "@remix-run/cloudflare";
import {
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";

import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { users } from "db/schema";
import { InferInsertModel, eq } from "drizzle-orm";
import { createClient } from "~/features/common/services/db.server";

export type AuthUser = {
  id: number;
  profileId: string;
  iconUrl: string;
  displayName: string;
};

type CreateUser = InferInsertModel<typeof users>;

let _authenticator: Authenticator<AuthUser> | undefined;
export function getAuthenticator(
  context: AppLoadContext
): Authenticator<AuthUser> {
  console.log("getAuthenticator called"); // デバッグ情報
  if (_authenticator == null) {
    console.log("Initializing _authenticator"); // デバッグ情報
    const env = context.env as Env;
    console.log("Environment: ", env); // 環境変数のデバッグ情報
    const cookie = createCookie("__session", {
      secrets: [env.SESSION_SECRET],
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
    });

    const sessionStorage = createWorkersKVSessionStorage({
      kv: env.SESSION_KV as KVNamespace,
      cookie,
    });
    _authenticator = new Authenticator<AuthUser>(sessionStorage);
    const googleAuth = new GoogleStrategy(
      {
        clientID: env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL: env.GOOGLE_AUTH_CALLBACK_URL,
      },
      async ({ profile }) => {
        console.log("Google Strategy Callback: ", profile); // Google認証情報のデバッグ情報
        const db = createClient(env.DB);
        console.log("DB client initialized"); // DBクライアントの初期化デバッグ情報
        const user = await db
          .select()
          .from(users)
          .where(eq(users.profileId, profile.id))
          .get();
        console.log("User found: ", user); // ユーザー検索結果のデバッグ情報
        if (user) return user as AuthUser;

        const newUser: CreateUser = {
          profileId: profile.id,
          iconUrl: profile.photos?.[0].value,
          displayName: profile.displayName,
          createdAt: new Date(),
        };

        const ret = await db.insert(users).values(newUser).returning().get();
        console.log("New user created: ", ret); // 新規ユーザー作成結果のデバッグ情報

        return {
          id: ret.id,
          profileId: profile.id,
          iconUrl: profile.photos?.[0].value,
          displayName: profile.displayName,
        };
      }
    );
    _authenticator.use(googleAuth);
  }
  return _authenticator;
}
