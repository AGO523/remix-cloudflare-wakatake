import { useState, useEffect } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getDialies } from "~/features/common/services/data.server";

// ローダー関数の型定義
export async function loader({ context }: LoaderFunctionArgs) {
  const dialies = await getDialies(context);
  return json({ dialies });
}

export default function Dialies() {
  const { dialies } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemsPerPage, setItemsPerPage] = useState(30); // 初期値はモバイルビュー用の30件
  const [animating, setAnimating] = useState(false);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  useEffect(() => {
    // クライアントサイドでのみ実行されるウィンドウの幅に応じた処理
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 2 : 30);
    };
    // 初回マウント時にも実行
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSearchParams({ page: page.toString() });
  }, [page, setSearchParams]);

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedDialies = dialies.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(dialies.length / itemsPerPage);

  const changePage = (newPage: number) => {
    setAnimating(true);
    setTimeout(() => {
      setPage(newPage);
      setAnimating(false);
    }, 2000); // アニメーションの持続時間に合わせる
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <Link to="/dialy/new" className="btn btn-sm m-4">
          護主印日記を書く
        </Link>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${
          animating ? "animate-flip-page" : ""
        }`}
      >
        {paginatedDialies.map((dialy, index) => (
          <div
            key={dialy.id}
            className="card max-w-lg bg-base-100 shadow-xl relative"
          >
            {index === 0 && (
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="absolute top-1/2 -translate-y-1/2 left-0 btn-circle btn-sm btn-outline z-10"
              >
                &lt;
              </button>
            )}
            {index === 1 && (
              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="absolute top-1/2 -translate-y-1/2 right-0 btn-circle btn-sm btn-outline z-10"
              >
                &gt;
              </button>
            )}
            <figure className="relative">
              <img
                src="https://storage.googleapis.com/prod-artora-arts/dev-images/goshuin5.png"
                alt="護主印日記の画像"
              />
              <figcaption className="absolute top-0 left-0 h-full w-full flex items-center justify-center p-4">
                <span
                  className="text-white text-lg font-bold"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "upright",
                  }}
                >
                  {dialy.content}
                </span>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}
