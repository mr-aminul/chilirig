import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faq";

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
              <div key={category.id}>
                <h2 className="mb-4 font-display text-2xl font-semibold text-[hsl(var(--text-primary))]">
                  {category.category}
                </h2>
                <Accordion type="single" className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={`${category.id}-${faq.id}`}
                    >
                      <AccordionTrigger
                        value={`${category.id}-${faq.id}`}
                        className="text-left"
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent
                        value={`${category.id}-${faq.id}`}
                        className="text-[hsl(var(--text-secondary))]"
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

