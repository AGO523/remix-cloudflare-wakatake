import { Link } from "@remix-run/react";

interface UserIconProps {
  userId: number;
  avatarUrl?: string | null;
  nickname?: string | null;
}

export function UserIcon({ userId, avatarUrl, nickname }: UserIconProps) {
  return (
    <div>
      <Link
        to={`/pokemon/${userId}/profile`}
        key={userId}
        unstable_viewTransition
      >
        <div className="flex items-center m-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="アバターの画像"
              className="w-10 h-10 rounded-full mr-2"
            />
          ) : (
            <div className="w-10 h-10 rounded-full mr-2 bg-gray-300"></div>
          )}
          {nickname ? (
            <p className="badge mt-1">作成者: {nickname}</p>
          ) : (
            <p className="badge mt-1">作成者: ユーザー_{userId}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
