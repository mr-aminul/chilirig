import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionContainer } from "@/components/SectionContainer";

export default function Loading() {
  return (
    <>
      <Header />
      <main>
        <SectionContainer>
          <div className="py-10 text-center text-gray-600">Loading FAQs...</div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}

