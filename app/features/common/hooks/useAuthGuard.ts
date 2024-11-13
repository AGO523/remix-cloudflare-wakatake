import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/firebase/AuthContext";

// shouldNavigate が true の場合のみ navigate を実行
// uid が渡された場合は、その uid とログイン中のユーザーの uid が一致するかを確認
function useAuthGuard(requiredUid?: string, shouldNavigate: boolean = true) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && shouldNavigate) {
      if (!isAuthenticated || user === null) {
        navigate("/login");
      } else if (requiredUid && user.uid !== requiredUid) {
        navigate("/login");
      }
    }
  }, [loading, isAuthenticated, navigate, user, requiredUid, shouldNavigate]);

  return { user, loading, isAuthenticated };
}

export default useAuthGuard;
