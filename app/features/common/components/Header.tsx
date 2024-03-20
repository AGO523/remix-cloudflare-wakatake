import { Link } from "@remix-run/react";

export const Header: React.FC = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          artora
        </Link>
      </div>
      <div className="flex-none">
        <div className="btn btn-ghost ml-2">
          <Link to="/admin" prefetch="intent">
            管理画面
          </Link>
        </div>
        <div className="btn btn-ghost ml-2">
          <Link to="/auth/logout">ログアウト</Link>
        </div>
      </div>
    </div>
  );
};
