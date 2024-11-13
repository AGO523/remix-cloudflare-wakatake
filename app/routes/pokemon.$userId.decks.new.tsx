// import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
// import { Form, useLoaderData, useNavigation } from "@remix-run/react";
// import {
//   createDeck,
//   getUserBy,
// } from "~/features/common/services/deck-data.server";
// import {
//   jsonWithError,
//   redirectWithError,
//   redirectWithSuccess,
// } from "remix-toast";
// import useAuthGuard from "~/features/common/hooks/useAuthGuard";

// // このページは userId をもつ必要はない
// // ユーザー固有のページである必要はない
// // uid を見えないようにして、uid で可変のページにしてやる
// export async function loader({ context, params }: LoaderFunctionArgs) {
//   const { userId } = params;
//   const user = await getUserBy(Number(userId), context);
//   if (!user || !user.uid) {
//     console.error("User not found, uid is null");
//     return redirectWithError(`/pokemon`, "アクセス権限がありません");
//   }
//   return { user };
// }

// export const action = async ({ context, request }: LoaderFunctionArgs) => {
//   const formData = await request.formData();
//   const userId = formData.get("userId");
//   const response = await createDeck(formData, context);
//   const responseData = await response.json();
//   if (response.status !== 201) {
//     return jsonWithError({}, responseData.message);
//   }

//   return redirectWithSuccess(`/pokemon/${userId}/decks`, responseData.message);
// };

// export default function DeckNew() {
//   const { user } = useLoaderData<typeof loader>();
//   useAuthGuard(user.uid);
//   const navigation = useNavigation();
//   const isSubmitting = navigation.state === "submitting";

//   return (
//     <div className="p-4 bg-base-200 flex justify-center">
//       <div className="w-full max-w-3xl min-w-0 px-2">
//         <h2 className="text-2xl font-semibold">デッキを作成する</h2>
//         <Form method="post">
//           {/* ここは uid に変更、クエリでuid から id を特定する */}
//           <input type="hidden" name="userId" value={user.id} />
//           <div>
//             <input
//               type="text"
//               placeholder="デッキコード（必須）"
//               className="input input-bordered input-lg w-full max-w-lg mt-2"
//               name="code"
//               required
//             />
//           </div>
//           <div>
//             <input
//               type="text"
//               placeholder="デッキ名（必須）"
//               className="input input-bordered input-lg w-full max-w-lg mt-2"
//               name="title"
//               required
//             />
//           </div>
//           <div>
//             <textarea
//               placeholder="デッキの説明"
//               className="textarea textarea-bordered textarea-lg w-full max-w-lg min-h-[200px] mt-2"
//               name="description"
//             />
//           </div>
//           <button
//             type="submit"
//             className="btn btn-info w-full max-w-xs mt-2"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "デッキを作成しています..." : "作成"}
//           </button>
//         </Form>
//       </div>
//     </div>
//   );
// }
