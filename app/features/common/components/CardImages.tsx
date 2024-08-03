import { useState, useEffect } from "react";

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert("画像のURLがクリップボードにコピーされました！");
  } catch (err) {
    alert("クリップボードにコピーできませんでした。");
  }
};

export default function CardImages({
  cardImages,
}: {
  cardImages: Array<{ id: number; imageUrl: string }>;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cardImages && cardImages.length > 0) {
      const img = new Image();
      img.src = cardImages[0].imageUrl;
      img.onload = () => setLoading(false);
    }
  }, [cardImages]);

  return (
    <div className="mt-4">
      {loading ? (
        <p className="text-center">画像を読み込んでいます...</p>
      ) : (
        <div>
          <p className="text-center">
            画像をクリックすると画像のURLがコピーできます
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 justify-center">
            {cardImages.map((cardImage) => (
              <button
                key={cardImage.id}
                onClick={() => copyToClipboard(cardImage.imageUrl)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    copyToClipboard(cardImage.imageUrl);
                  }
                }}
                className="flex justify-center items-center"
                aria-label="画像のURLをコピー"
              >
                <img
                  src={cardImage.imageUrl}
                  alt={`デッキの画像 ${cardImage.id}`}
                  className="object-cover rounded-sm max-h-40 max-w-40"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
