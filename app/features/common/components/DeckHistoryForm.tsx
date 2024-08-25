import { Form } from "@remix-run/react";

type DeckHistoryFormProps = {
  method: "post" | "put";
  action: string;
  isSubmitting: boolean;
  defaultValues?: {
    deckId?: number;
    userId?: number;
    status?: string;
    content?: string;
    code?: string;
    cardImageUrl?: string;
  };
};

export default function DeckHistoryForm({
  method,
  action,
  isSubmitting,
  defaultValues = {},
}: DeckHistoryFormProps) {
  return (
    <Form method={method} action={action} className="space-y-4">
      <input type="hidden" name="deckId" value={defaultValues.deckId} />
      <input type="hidden" name="userId" value={defaultValues.userId} />
      <div>
        <select
          name="status"
          defaultValue={defaultValues.status || "main"}
          className="select select-bordered w-full"
          required
        >
          <option value="main">公開</option>
          <option value="sub">非公開</option>
          <option value="draft">下書き</option>
        </select>
      </div>
      <div>
        <textarea
          name="content"
          placeholder="内容"
          defaultValue={defaultValues.content || ""}
          className="textarea textarea-bordered w-full min-h-[300px]"
        ></textarea>
      </div>

      {/* 履歴にデッキコードを挿入 */}
      <div className="divider">デッキ画像</div>
      <div className="mt-4 mb-4">
        <input
          type="text"
          name="code"
          placeholder="デッキコードを入力(任意)"
          defaultValue={defaultValues.code || ""}
          className="input input-bordered w-full"
        />

        <select className="select select-bordered w-full mt-2" name="first">
          <option disabled selected>
            デッキ画像のステータスを選択
          </option>
          <option value="first">メイン</option>
          <option value="sub">サブ</option>
        </select>
      </div>

      <div className="divider">その他の画像</div>
      <div>
        <input
          type="text"
          name="cardImageUrl"
          placeholder="挿入する画像のURLを添付(任意)"
          defaultValue={defaultValues.cardImageUrl || ""}
          className="input input-bordered w-full"
        />
        <p className="text-gray-600 text-sm">
          デッキ画像とは別に、この履歴に1枚まで画像を添付できます
          <br />
          「画像を表示」ボタンから、画像を選んでURLをコピーできます
          <br />
          「画像をアップロード」ボタンから、新しい画像をアップロードできます
        </p>
      </div>

      <div className="divider"></div>
      <div>
        <button
          type="submit"
          className="btn btn-info w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </div>
    </Form>
  );
}
