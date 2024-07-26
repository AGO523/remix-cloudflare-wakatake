export type DeckCode = {
  id: number;
  deckId: number;
  historyId: number | null;
  status: string;
  code: string;
  imageUrl: string;
  createdAt: number;
};

export type Deck = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
  codes: DeckCode[];
};
