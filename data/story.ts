export type StoryPromiseIcon = "leaf" | "flame" | "layers";

export type StoryPromiseCard = {
  title: string;
  body: string;
  icon: StoryPromiseIcon;
};

export type StoryPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  section1: {
    heading: string;
    body: string;
    imageUrl: string;
  };
  section2: {
    heading: string;
    body: string;
    imageUrl: string;
  };
  promises: [StoryPromiseCard, StoryPromiseCard, StoryPromiseCard];
  cta: {
    label: string;
    href: string;
  };
};
