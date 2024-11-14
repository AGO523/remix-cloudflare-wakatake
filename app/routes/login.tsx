// クライアントサイドでFirebaseの認証を使ってログインするため、状態管理はremixではなく、生のreactを使用

import { useNavigate, useFetcher } from "@remix-run/react";
import {
  loginAnonymously,
  logout,
  loginWithGoogle,
  linkAnonymousToGoogle,
} from "~/firebase/auth";
import { useAuth } from "~/firebase/AuthContext";
import google_icon from "../images/google_icon.png";
import { useState } from "react";

export default function Login() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleLogin = async () => {
    setIsButtonDisabled(true);
    try {
      await loginAnonymously();
      navigate("/pokemon");
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleLogout = async () => {
    setIsButtonDisabled(true);
    try {
      await logout();
      navigate("/pokemon");
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsButtonDisabled(true);
    try {
      await loginWithGoogle();
      navigate("/pokemon");
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleLinkAnonymousToGoogle = async () => {
    setIsButtonDisabled(true);
    try {
      await linkAnonymousToGoogle();
    } finally {
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="p-8 rounded-lg shadow-lg max-w-md w-full mt-[-20%]">
        <h1 className="text-3xl font-bold text-center mb-6">ログイン</h1>

        {!loading && !isAuthenticated ? (
          <>
            {/* 旧Googleログインボタン */}
            {/* <Form
              method="post"
              action="/auth/google"
              className="flex justify-center mb-4"
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 text-base-content font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                disabled={isButtonDisabled || fetcher.state !== "idle"}
              >
                <img
                  src={google_icon}
                  alt="Google icon"
                  className="w-6 h-6 mr-3"
                />
                Googleアカウントでログイン
              </button>
            </Form> */}

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300 mb-2"
              disabled={isButtonDisabled || fetcher.state !== "idle"}
            >
              <img
                src={google_icon}
                alt="Google icon"
                className="w-6 h-6 mr-3"
              />
              Googleアカウントでログイン
            </button>

            {/* 匿名ログインボタン */}
            <button
              onClick={handleLogin}
              className="btn btn-primary w-full mb-2"
              disabled={isButtonDisabled || fetcher.state !== "idle"}
            >
              匿名でログイン
            </button>

            <button
              onClick={handleLinkAnonymousToGoogle}
              className="btn btn-primary w-full"
              disabled={isButtonDisabled || fetcher.state !== "idle"}
            >
              <img
                src={google_icon}
                alt="Google icon"
                className="w-6 h-6 mr-3"
              />
              匿名アカウントをGoogleとリンク
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLinkAnonymousToGoogle}
              className="btn btn-primary w-full mb-2"
              disabled={isButtonDisabled || fetcher.state !== "idle"}
            >
              <img
                src={google_icon}
                alt="Google icon"
                className="w-6 h-6 mr-3"
              />
              匿名アカウントをGoogleとリンク
            </button>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="btn btn-error w-full"
              disabled={isButtonDisabled || fetcher.state !== "idle"}
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </div>
  );
}
