import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Esonet Concept AI Skill Training" },
      {
        name: "description",
        content:
          "Talk to Esonet Concept AI Skill Training. Email info@esonetconcept.com or chat with us on WhatsApp at +234 704 820 0526.",
      },
      { property: "og:title", content: "Contact Esonet Concept" },
      { property: "og:description", content: "Email, WhatsApp and social links for Esonet Concept AI Skill Training." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(25).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      subject: parsed.data.subject ?? "",
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error("We couldn't send that. Please try WhatsApp or email instead.");
      return;
    }
    toast.success("Message sent. We'll get back to you shortly.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero-glow opacity-50" aria-hidden />
        <div className="relative mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-4xl font-bold sm:text-5xl">Let's talk</h1>
          <p className="mt-4 text-muted-foreground">
            Questions about a course, payment or your schedule? Reach us any way you prefer — WhatsApp is
            the fastest.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Send a message</CardTitle>
            <CardDescription>We reply within one working day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    maxLength={120}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    maxLength={255}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone / WhatsApp (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    maxLength={25}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(event) => update("subject", event.target.value)}
                    maxLength={150}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  maxLength={2000}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full gradient-brand text-primary-foreground"
              >
                {loading ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <a
            href={whatsappLink("Hello Esonet Concept!")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-success/50 bg-card/70 p-6 transition-colors hover:border-success"
          >
            <MessageCircle className="size-6 shrink-0 text-success" />
            <div>
              <p className="font-display text-base font-semibold">Chat on WhatsApp</p>
              <p className="mt-1 text-sm text-muted-foreground">{SITE.whatsappDisplay}</p>
            </div>
          </a>

          <a
            href={`mailto:${SITE.email}`}
            className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-6 transition-colors hover:border-primary"
          >
            <Mail className="size-6 shrink-0 text-primary" />
            <div>
              <p className="font-display text-base font-semibold">Email us</p>
              <p className="mt-1 text-sm text-muted-foreground">{SITE.email}</p>
            </div>
          </a>

          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-6 transition-colors hover:border-primary"
          >
            <Facebook className="size-6 shrink-0 text-primary" />
            <div>
              <p className="font-display text-base font-semibold">Facebook</p>
              <p className="mt-1 text-sm text-muted-foreground">esonet concept</p>
            </div>
          </a>

          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-6 transition-colors hover:border-primary"
          >
            <Instagram className="size-6 shrink-0 text-accent" />
            <div>
              <p className="font-display text-base font-semibold">Instagram</p>
              <p className="mt-1 text-sm text-muted-foreground">esonet concept</p>
            </div>
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
