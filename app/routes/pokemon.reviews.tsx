// ポケカとポケポケでページを分ける

// ポケカのレビュー一覧ページ
// /pokemon/reviews/cards
// ポケカのカードレビュー詳細ページ
// /pokemon/reviews/cards/:id

// ポケポケのレビュー一覧ページ
// /pokemon/reviews/pokepoke/cards
// ポケポケのカードレビュー詳細ページ
// /pokemon/reviews/pokepoke/cards/:id

// 共通のカード作成ページ
// 管理者専用
// DBは共通なので、パスは同じ
// /pokemon/reviews/new

import { Outlet } from "@remix-run/react";

export default function ReviewsLayout() {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
}
