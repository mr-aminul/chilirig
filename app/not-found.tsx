import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-display text-6xl font-bold text-gray-900">
            404
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Page not found. The heat must have been too much!
          </p>
          <Link href="/">
            <Button size="lg">Back to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

