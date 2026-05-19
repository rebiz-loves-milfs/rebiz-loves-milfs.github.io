export interface ReadingItem {
  title: string;
  author: string;
  type: 'book' | 'article' | 'manga' | 'light-novel';
  status: 'reading' | 'finished' | 'want-to-read';
  url?: string;
  cover?: string;
  rating?: number; // 1-5
  note?: string;
}

export const READING_LIST: ReadingItem[] = [
  {
    title: "Spice and Wolf, Vol. 1",
    author: "Isuna Hasekura",
    type: "light-novel",
    status: "finished",
    rating: 5,
    note: "The economics are fascinating.",
  },
  {
    title: "The Art of Writing Readable Code",
    author: "Dustin Boswell",
    type: "book",
    status: "reading",
  },
  {
    title: "Mushishi",
    author: "Yuki Urushibara",
    type: "manga",
    status: "finished",
    rating: 5,
  },
  {
    title: "Frieren: Beyond Journey's End",
    author: "Kanehito Yamada",
    type: "manga",
    status: "reading",
  },
  {
    title: "Design Tokens Community Group",
    author: "W3C",
    type: "article",
    status: "want-to-read",
    url: "https://www.w3.org/community/design-tokens/",
  },
];
