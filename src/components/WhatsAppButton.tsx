import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hello Esonet Concept, I'd like to know more about your AI training courses.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Esonet Concept on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-success px-4 py-3 text-sm font-semibold text-success-foreground shadow-glow transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
