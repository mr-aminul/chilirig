"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight,
  HelpCircle,
  Package,
  RotateCcw,
  Truck,
  Flame,
} from "lucide-react";
import { FAQCategory } from "@/data/faq";
import { getCachedApiJson } from "@/lib/api-cache";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQCategory[]>([]);

  const getCategoryIcon = (category: string) => {
    const key = category.toLowerCase();
    if (key.includes("shipping")) return Truck;
    if (key.includes("return")) return RotateCcw;
    if (key.includes("heat")) return Flame;
    if (key.includes("product")) return Package;
    return HelpCircle;
  };

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const result = await getCachedApiJson<{ success: boolean; data?: FAQCategory[] }>(
          "/api/faq",
          { ttlMs: 10 * 60 * 1000 }
        );
        if (result.success) {
          setFaqs(result.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      }
    };
    loadFaqs();
  }, []);

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
                <div className="mb-4 flex items-center gap-3">
                  {(() => {
                    const Icon = getCategoryIcon(category.category);
                    return <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />;
                  })()}
                  <h2 className="font-display text-2xl font-semibold text-[hsl(var(--text-primary))]">
                    {category.category}
                  </h2>
                </div>
                <Accordion
                  key={`${category.id}-${category.questions.length}`}
                  type="multiple"
                  defaultValue={category.questions.map(
                    (faq) => `${category.id}-${faq.id}`
                  )}
                  className="w-full"
                >
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={`${category.id}-${faq.id}`}
                    >
                      <AccordionTrigger
                        value={`${category.id}-${faq.id}`}
                        className="text-left"
                      >
                        <span className="flex items-start gap-2">
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                          <span>{faq.question}</span>
                        </span>
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

