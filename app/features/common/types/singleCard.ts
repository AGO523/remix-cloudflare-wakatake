export type SingleCardFormData = {
  userId: number;
  imageUrl?: string;
  name: string;
  type: string;
  rule?: string;
  gameType: "ポケモンカード" | "ポケポケ"; // ゲームタイプは特定の文字列のみ
};
