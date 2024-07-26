import { Deck } from "~/features/common/types/deck";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDeckDates(deck: any): Deck {
  return {
    ...deck,
    createdAt: new Date(deck.createdAt),
    updatedAt: new Date(deck.updatedAt),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    codes: deck.codes.map((code: any) => ({
      ...code,
      createdAt: new Date(code.createdAt),
    })),
  };
}
