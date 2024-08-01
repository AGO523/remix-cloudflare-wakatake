import { Link, useLocation } from "@remix-run/react";

export const Header: React.FC = () => {
  const location = useLocation();
  const isPokemonPath = location.pathname.startsWith("/pokemon");
  const isLoginPath = location.pathname.startsWith("/login");

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        {isPokemonPath || isLoginPath ? (
          <Link to="/pokemon" className="btn btn-ghost normal-case text-bold">
            ポケヒス
          </Link>
        ) : (
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            artora
          </Link>
        )}
      </div>
      <div className="flex-none">
        {!isPokemonPath && !isLoginPath ? (
          <div className="btn btn-ghost ml-2">
            <Link to="/arts" prefetch="intent">
              作品一覧
            </Link>
          </div>
        ) : (
          <></>
          // <div className="btn btn-ghost ml-2">
          //   <Link to="/pokemon/decks" prefetch="intent">
          //     みんなのデッキ
          //   </Link>
          // </div>
        )}
      </div>
    </div>
  );
};
