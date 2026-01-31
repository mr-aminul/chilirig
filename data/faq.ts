export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  category: string;
  questions: FAQItem[];
}

export const faqs: FAQCategory[] = [
  {
    id: "1",
    category: "Shipping",
    questions: [
      {
        id: "1",
        question: "How long does shipping take?",
        answer:
          "We ship within 24 hours of your order. Standard shipping takes 3-5 business days. Express shipping (2-3 business days) is available at checkout.",
      },
      {
        id: "2",
        question: "Do you offer free shipping?",
        answer:
          "Yes! Free shipping is available on all orders over ৳5,000. For orders under ৳5,000, standard shipping is ৳599.",
      },
      {
        id: "3",
        question: "Do you ship internationally?",
        answer:
          "Currently, we only ship within the United States. We're working on expanding internationally soon!",
      },
    ],
  },
  {
    id: "2",
    category: "Returns",
    questions: [
      {
        id: "4",
        question: "What is your return policy?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us for a full refund.",
      },
      {
        id: "5",
        question: "How do I return a product?",
        answer:
          "Contact us at hello@chilirig.com with your order number, and we'll provide return instructions. We'll cover return shipping costs.",
      },
    ],
  },
  {
    id: "3",
    category: "Heat Levels",
    questions: [
      {
        id: "6",
        question: "What heat level should I choose?",
        answer:
          "If you're new to spicy food, start with Mild (1) or Medium (2). If you enjoy heat, try Hot (3) or Very Hot (4). Extreme (5) is for serious heat seekers only.",
      },
      {
        id: "7",
        question: "Can I adjust the heat level?",
        answer:
          "You can control the heat by using more or less chili oil. Start with a small amount and add more to taste.",
      },
      {
        id: "8",
        question: "What's the difference between the heat levels?",
        answer:
          "Heat levels are determined by the type and amount of chilies used. All levels maintain complex flavor—the difference is the intensity of the heat.",
      },
    ],
  },
  {
    id: "4",
    category: "Product",
    questions: [
      {
        id: "9",
        question: "How long does the chili oil last?",
        answer:
          "Unopened, our chili oil lasts up to 2 years when stored in a cool, dry place. After opening, refrigerate and consume within 6 months for best quality.",
      },
      {
        id: "10",
        question: "Do you use preservatives?",
        answer:
          "No. Our chili oil is made with real ingredients only—no preservatives, no artificial flavors, no additives.",
      },
      {
        id: "11",
        question: "Is the chili oil vegan?",
        answer:
          "Our Original Recipe and Extra Hot varieties are vegan. Our Beef Chili Oil contains real beef and is not vegan.",
      },
      {
        id: "12",
        question: "How should I store the chili oil?",
        answer:
          "Store unopened jars in a cool, dry place. After opening, refrigerate to maintain freshness and flavor.",
      },
    ],
  },
];
