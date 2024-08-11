import { Link } from "@remix-run/react";
import { useState } from "react";

type ArtCardProps = {
  art: {
    id: number;
    title: string;
    content: string;
    price: number;
    productUrl?: string | null;
  };
  artImages: {
    imageUrl: string;
  }[];
  adminPath?: boolean;
};

export function ArtCard({ art, artImages, adminPath }: ArtCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextImage = () => {
    setActiveIndex((current) => (current + 1) % artImages.length);
  };

  const prevImage = () => {
    setActiveIndex(
      (current) => (current - 1 + artImages.length) % artImages.length
    );
  };

  return (
    <div className="card max-w-xl bg-base-100 shadow-xl">
      <div className="relative">
        {artImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="btn btn-circle btn-sm btn-outline absolute left-0 top-1/2 -translate-y-1/2 z-10"
            >
              &lt;
            </button>
            <figure>
              <img
                src={artImages[activeIndex].imageUrl}
                alt={`${art.title} の画像`}
                className="w-full"
              />
            </figure>
            <button
              onClick={nextImage}
              className="btn btn-circle btn-sm btn-outline absolute right-0 top-1/2 -translate-y-1/2 z-10"
            >
              &gt;
            </button>
          </>
        )}
        {artImages.length === 1 && (
          <figure>
            <img
              src={artImages[0].imageUrl}
              alt={`${art.title} の画像`}
              className="w-full"
            />
          </figure>
        )}
      </div>
      <div className="card-body">
        <h2 className="card-title">{art.title}</h2>
        <p>
          {art.content}
          <br />
          価格: {art.price} 円
        </p>
        <div className="card-actions justify-end">
          {art.productUrl && (
            <Link to={art.productUrl} className="btn btn-info">
              商品の販売ページへ
            </Link>
          )}
          {adminPath && (
            <div>
              <Link
                to={`/admin/${art.id}/upload-image`}
                className="btn btn-info mr-2"
              >
                画像をアップロード
              </Link>
              <Link to={`/admin/${art.id}/edit`} className="btn btn-info">
                編集
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
