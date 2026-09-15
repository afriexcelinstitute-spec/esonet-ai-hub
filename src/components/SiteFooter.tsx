import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";

import { Logo } from "@/components/Logo";
import { SITE, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-surface/50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Esonet Concept AI Skill Training equips beginners, professionals, entrepreneurs and students
            with practical artificial intelligence skills they can apply from day one.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Esonet Concept on Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Esonet Concept on Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/courses" className="text-muted-foreground hover:text-foreground">
                AI training courses
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-muted-foreground hover:text-foreground">
                Register / Enroll
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-4 shrink-0" /> {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="size-4 shrink-0" /> {SITE.whatsappDisplay}
              </a>
            </li>
            <li className="text-muted-foreground">Facebook / Instagram: esonet concept</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
