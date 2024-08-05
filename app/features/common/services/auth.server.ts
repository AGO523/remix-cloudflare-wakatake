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
  email: string;
  iconUrl: string;
  displayName: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
};
type CreateUser = InferInsertModel<typeof users>;

let _authenticator: Authenticator<AuthUser> | null = null;

export function getAuthenticator(
  context: AppLoadContext
): Authenticator<AuthUser> {
  if (!_authenticator) {
    _authenticator = initializeAuthenticator(context);
  }
  return _authenticator;
}

function initializeAuthenticator(
  context: AppLoadContext
): Authenticator<AuthUser> {
  const env = context.env as Env;

  const cookie = createSessionCookie(env);
  const sessionStorage = createSessionStorage(env, cookie);

  const authenticator = new Authenticator<AuthUser>(sessionStorage);
  setupGoogleStrategy(env, authenticator);

  return authenticator;
}

function createSessionCookie(env: Env) {
  return createCookie("__session", {
    secrets: [env.SESSION_SECRET],
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function createSessionStorage(
  env: Env,
  cookie: ReturnType<typeof createCookie>
) {
  return createWorkersKVSessionStorage({
    kv: env.SESSION_KV as KVNamespace,
    cookie,
  });
}

function setupGoogleStrategy(env: Env, authenticator: Authenticator<AuthUser>) {
  const googleAuth = new GoogleStrategy(
    {
      clientID: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: env.GOOGLE_AUTH_CALLBACK_URL,
    },
    async ({ profile }) => {
      const db = createClient(env.DB);

      // 既存のユーザーを検索
      const user = await db
        .select()
        .from(users)
        .where(eq(users.profileId, profile.id))
        .get();
      if (user) return user as AuthUser;

      // 新規ユーザーを作成
      const newUser: CreateUser = {
        profileId: profile.id,
        email: profile.emails?.[0].value,
        iconUrl: profile.photos?.[0].value,
        displayName: profile.displayName,
        createdAt: new Date(),
      };

      const ret = await db.insert(users).values(newUser).returning().get();
      return {
        id: ret.id,
        profileId: profile.id,
        email: profile.emails?.[0].value,
        iconUrl: profile.photos?.[0].value,
        displayName: profile.displayName,
      };
    }
  );

  authenticator.use(googleAuth);
}
