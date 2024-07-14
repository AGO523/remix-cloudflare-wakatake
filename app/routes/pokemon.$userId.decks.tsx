import { Outlet } from "@remix-run/react";

export default function DecksByUserLayout() {
  return (
    <div className="container mx-auto">
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
