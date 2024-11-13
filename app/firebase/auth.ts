/////////////////////////////////////////////////////////////
// 本番環境の Firebase と D1 を使用している
// 開発時は手動でクエリを使用する
/////////////////////////////////////////////////////////////

import {
  signInWithPopup,
  linkWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { initializeFirebase } from "./firebase";
import { toast } from "react-toastify";

// 再ログインの際には、リンクされたアカウントを取得して、そのアカウントでログインする
export async function loginWithGoogle() {
  const auth = initializeFirebase();
  if (!auth) {
    toast.error("認証の初期化に失敗しました");
    return;
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    await saveUserToDatabase(idToken, result.user);

    toast.success("Googleアカウントでログインしました");
  } catch (error) {
    toast.error("Googleログインに失敗しました");
  }
}

export async function linkAnonymousToGoogle() {
  const auth = initializeFirebase();
  if (!auth) {
    toast.error("認証の初期化に失敗しました");
    return;
  }

  try {
    const user = auth.currentUser;
    if (user && user.isAnonymous) {
      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(user, provider);
      const linkedUser = result.user;
      const idToken = await linkedUser.getIdToken();
      await updateUserToDatabase(idToken, linkedUser, user.uid);

      toast.success("匿名アカウントがGoogleアカウントとリンクされました");
    } else {
      toast.error("現在のユーザーは匿名ではありません");
    }
  } catch (error) {
    toast.error("予期せぬエラーです。運営者にお問い合わせください");
  }
}

export async function loginAnonymously() {
  const auth = initializeFirebase();
  if (!auth) {
    toast.error("認証の初期化に失敗しました");
    return;
  }

  try {
    const result = await signInAnonymously(auth);
    const idToken = await result.user.getIdToken();

    await saveUserToDatabase(idToken, result.user);

    toast.success("匿名アカウントでログインしました");
  } catch (error) {
    toast.error("匿名ログインに失敗しました");
  }
}

export async function logout() {
  const auth = initializeFirebase();
  if (!auth) {
    toast.error("認証の初期化に失敗しました");
    return;
  }

  try {
    await signOut(auth);
    toast.success("ログアウトしました");
  } catch (error) {
    toast.error("ログアウトに失敗しました");
  }
}

// これは pubsub に任せてパフォーマンスを向上させる?
async function saveUserToDatabase(idToken: string, user: FirebaseUser) {
  const { uid, email, displayName, photoURL } = user;
  // TODO: remove later (profileId はgoogle認証で取得したIDだったが、firebase に移管したため不要)
  const profileId = "";
  const response = await fetch(
    "https://pokemon-card-deck-scraper-ghyv6dyl6a-an.a.run.app/saveUser",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid,
        email,
        displayName: displayName || "",
        iconUrl: photoURL,
        profileId,
        createdAt: Date.now(),
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save user");
  }
}

async function updateUserToDatabase(
  idToken: string,
  user: FirebaseUser,
  uid: string
) {
  const { email, displayName, photoURL } = user;
  if (uid !== user.uid) {
    throw new Error("Invalid uid");
  }

  const response = await fetch(
    "https://pokemon-card-deck-scraper-ghyv6dyl6a-an.a.run.app/updateUser",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        uid,
        email,
        displayName: displayName || "",
        iconUrl: photoURL,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }
}
