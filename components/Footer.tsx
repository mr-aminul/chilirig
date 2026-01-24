import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-[hsl(var(--bg-secondary))]">
      <div className="container-padding section-padding mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-[hsl(var(--text-primary))]">
              ChiliRig
            </h3>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Blazing flavor, bottled for you. Crafted with real ingredients,
              slow-infused for depth. Heat with bite. Flavor without limits.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--primary))]"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--primary))]"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--primary))]"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Email"
                className="text-[hsl(var(--text-secondary))] transition-colors hover:text-[hsl(var(--primary))]"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Pages</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/story"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Story
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Support</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Heat Levels
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@chilirig.com"
                  className="transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Contact</h4>
            <ul className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <li>hello@chilirig.com</li>
              <li>+1 (555) 123-4567</li>
              <li className="pt-2">
                <p>123 Spice Street</p>
                <p>Flavor City, FC 12345</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-black/10 pt-8 text-center text-sm text-[hsl(var(--text-muted))]">
          <p>© {currentYear} ChiliRig. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
