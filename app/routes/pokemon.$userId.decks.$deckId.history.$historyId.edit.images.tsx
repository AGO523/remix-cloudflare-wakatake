import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/features/common/services/auth.server";
import { getCardImagesBy } from "~/features/common/services/deck-data.server";
import CardImages from "~/features/common/components/CardImages";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const userId = user.id;
  const cardImages = await getCardImagesBy(userId, context);
  return json({ cardImages });
}

export default function EditDeckHistory() {
  const { cardImages } = useLoaderData<typeof loader>();

  return (
    <div>
      <CardImages cardImages={cardImages} />
    </div>
  );
}
