"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setEmail("");
    setLoading(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
        aria-label="Email address"
      />
      <Button 
        type="submit" 
        size="lg" 
        variant="default"
        className="whitespace-nowrap"
        disabled={loading || submitted}
      >
        {loading ? (
          <>
            <Loader size="sm" className="mr-2" />
            Subscribing...
          </>
        ) : submitted ? (
          "Subscribed!"
        ) : (
          <>
            Subscribe
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
