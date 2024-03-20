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
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>ナビゲーション</summary>
              <ul className="p-2 bg-base-100">
                <li>
                  <Link to="/admin">管理画面</Link>
                </li>
                <li>
                  <Link to="/auth/logout">ログアウト</Link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
};
