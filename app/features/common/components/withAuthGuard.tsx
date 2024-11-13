// // 使用していない

// import React, { useEffect } from "react";
// import { useNavigate } from "@remix-run/react";
// import { useAuth } from "~/firebase/AuthContext";
// import { User as FirebaseUser } from "firebase/auth";

// export function withAuthGuard<T extends object>(
//   WrappedComponent: React.ComponentType<T & { user: FirebaseUser }>,
//   requiredUid?: string // オプションの uid パラメータ
// ) {
//   return function AuthGuardedComponent(props: T) {
//     const { user, loading, isAuthenticated } = useAuth();
//     const navigate = useNavigate();

//     console.log("user", user);
//     console.log("uid", requiredUid);

//     useEffect(() => {
//       // ロード完了後に認証状態をチェック
//       if (!loading) {
//         // ユーザーが未認証の場合
//         if (!isAuthenticated || user === null) {
//           navigate("/login");
//         } else if (requiredUid && user.uid !== requiredUid) {
//           // ユーザーの uid が一致しない場合
//           navigate("/login");
//         }
//       }
//     }, [loading, isAuthenticated, navigate, user]);

//     if (loading) {
//       return <div>Loading...</div>;
//     }

//     if (!isAuthenticated || user === null) {
//       return null;
//     }

//     return <WrappedComponent {...props} user={user} />;
//   };
// }
