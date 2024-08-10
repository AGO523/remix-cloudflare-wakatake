import { Outlet } from "@remix-run/react";

export default function DecksByUserLayout() {
  return (
    <div className="w-full text-center">
      <Outlet />
    </div>
  );
}
