import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "We ship within 24 hours of your order. Standard shipping takes 3-5 business days. Express shipping (2-3 business days) is available at checkout.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! Free shipping is available on all orders over $50. For orders under $50, standard shipping is $5.99.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we only ship within the United States. We're working on expanding internationally soon!",
      },
    ],
  },
  {
    category: "Returns",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us for a full refund.",
      },
      {
        question: "How do I return a product?",
        answer:
          "Contact us at hello@chilirig.com with your order number, and we'll provide return instructions. We'll cover return shipping costs.",
      },
    ],
  },
  {
    category: "Heat Levels",
    questions: [
      {
        question: "What heat level should I choose?",
        answer:
          "If you're new to spicy food, start with Mild (1) or Medium (2). If you enjoy heat, try Hot (3) or Very Hot (4). Extreme (5) is for serious heat seekers only.",
      },
      {
        question: "Can I adjust the heat level?",
        answer:
          "You can control the heat by using more or less chili oil. Start with a small amount and add more to taste.",
      },
      {
        question: "What's the difference between the heat levels?",
        answer:
          "Heat levels are determined by the type and amount of chilies used. All levels maintain complex flavor—the difference is the intensity of the heat.",
      },
    ],
  },
  {
    category: "Product",
    questions: [
      {
        question: "How long does the chili oil last?",
        answer:
          "Unopened, our chili oil lasts up to 2 years when stored in a cool, dry place. After opening, refrigerate and consume within 6 months for best quality.",
      },
      {
        question: "Do you use preservatives?",
        answer:
          "No. Our chili oil is made with real ingredients only—no preservatives, no artificial flavors, no additives.",
      },
      {
        question: "Is the chili oil vegan?",
        answer:
          "Our Original Recipe and Extra Hot varieties are vegan. Our Beef Chili Oil contains real beef and is not vegan.",
      },
      {
        question: "How should I store the chili oil?",
        answer:
          "Store unopened jars in a cool, dry place. After opening, refrigerate to maintain freshness and flavor.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Everything you need to know about ChiliRig
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-8">
            {faqs.map((category) => (
              <div key={category.category}>
                <h2 className="mb-4 font-display text-2xl font-semibold text-gray-900">
                  {category.category}
                </h2>
                <Accordion type="single" className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.category}-${index}`}
                    >
                      <AccordionTrigger
                        value={`${category.category}-${index}`}
                        className="text-left"
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent
                        value={`${category.category}-${index}`}
                        className="text-gray-600"
                      >
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

