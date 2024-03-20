/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Link } from "@remix-run/react";

export const Header: React.FC = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown dropdown-bottom">
          <button tabIndex={0} className="btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <ul
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            tabIndex={0}
          >
            <li>
              <Link to="/login">ログイン</Link>
            </li>
            <li>
              <Link to="/admin">管理画面</Link>
            </li>
            <li>
              <Link to="/auth/logout">ログアウト</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          artora
        </Link>
      </div>
      <div className="navbar-end"></div>
    </div>
  );
};
