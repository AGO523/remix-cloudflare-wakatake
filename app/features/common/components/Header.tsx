import { Link } from "@remix-run/react";

export const Header: React.FC = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link to="#" className="btn btn-ghost text-xl">
          Artora
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="#">作品</Link>
          </li>
          <li>
            <details>
              <summary>メニュー</summary>
              <ul className="p-2 bg-base-100 rounded-t-none">
                <li>
                  <Link to="#">Link 1</Link>
                </li>
                <li>
                  <Link to="#">Link 2</Link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
};
