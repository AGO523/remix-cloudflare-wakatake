import { Link } from "@remix-run/react";

export const Header: React.FC = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/pokemon" className="btn btn-ghost normal-case text-xl">
          artora
        </Link>
      </div>
      <div className="flex-none">
        <div className="btn btn-ghost ml-2">
          <Link to="/arts" prefetch="intent">
            作品一覧
          </Link>
        </div>
        <div className="btn btn-ghost ml-2">
          <Link to="/pokemon" prefetch="intent">
            ポケヒス
          </Link>
        </div>
        <div className="btn btn-ghost ml-2">
          <Link to="/login">ログイン</Link>
        </div>
      </div>
    </div>
  );
};
