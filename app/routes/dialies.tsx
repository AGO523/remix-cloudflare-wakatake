import { useState, useEffect } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  getDialies,
  deleteDialy,
} from "~/features/common/services/data.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const dialies = await getDialies(context);
  return json({ dialies });
}

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  return await deleteDialy(formData, context);
};

export default function Dialies() {
  const { dialies } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [animating, setAnimating] = useState(false);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 2 : 30);
    };
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
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Tsukimi+Rounded&display=swap');
          .tsukimi-font {
            font-family: 'Tsukimi Rounded', sans-serif;
          }
        `}
      </style>
      <div>
        <Link to="/dialy/new" className="btn btn-sm m-4 tsukimi-font">
          護主印日記をかく
        </Link>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${
          animating ? "animate-flip-page" : ""
        } tsukimi-font`}
      >
        {paginatedDialies.map((dialy, index) => (
          <div
            key={dialy.id}
            className="card max-w-lg bg-base-100 shadow-xl relative"
          >
            <div>
              <Form method="post">
                <input type="hidden" name="dialyId" value={dialy.id} />
                <button
                  type="submit"
                  name="_action"
                  value="delete"
                  className="btn btn-circle btn-sm absolute top-0 right-0 z-10"
                >
                  &times;
                </button>
              </Form>
            </div>
            {index === 0 && (
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="absolute top-1/2 -translate-y-1/2 left-0 btn-circle btn-sm z-10"
              >
                &lt;
              </button>
            )}
            {index === 1 && (
              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="absolute top-1/2 -translate-y-1/2 right-0 btn-circle btn-sm z-10"
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
                  className="m-6 text-lg font-bold"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "upright",
                  }}
                >
                  {dialy.content.split("\n").map((line, idx) => (
                    <span key={idx} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </span>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}
