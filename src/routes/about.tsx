import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Eye, GraduationCap, Handshake, Rocket, Target, Users, Wrench } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/esonet-logo.png.asset.json";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Esonet Concept AI Skill Training" },
      {
        name: "description",
        content:
          "Esonet Concept exists to make artificial intelligence skills practical and accessible for beginners, professionals, entrepreneurs and students.",
      },
      { property: "og:title", content: "About Esonet Concept AI Skill Training" },
      {
        property: "og:description",
        content: "Our mission, vision and practical approach to building real AI skills.",
      },
    ],
  }),
  component: About,
});

const AUDIENCES = [
  {
    icon: Compass,
    title: "Beginners",
    body: "We start from the absolute basics — no jargon, no coding. You leave able to use AI tools with confidence.",
  },
  {
    icon: Rocket,
    title: "Entrepreneurs",
    body: "Practical playbooks for marketing, customer service, content and operations so a small team can perform like a big one.",
  },
  {
    icon: Users,
    title: "Professionals",
    body: "Automate reporting, writing, research and meetings, and become the person your team relies on for AI.",
  },
  {
    icon: GraduationCap,
    title: "Students",
    body: "Study smarter, build a portfolio and graduate with a skill that is genuinely in demand.",
  },
];

function About() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero-glow opacity-60" aria-hidden />
        <div className="relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
          <img src={logo.url} alt="Esonet Concept logo" className="mx-auto h-20 w-auto" />
          <h1 className="mt-8 text-4xl font-bold sm:text-5xl">About Esonet Concept</h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            We are an AI skill training institute built on one belief: artificial intelligence should be a
            tool in everyone's hands, not a mystery reserved for engineers. We teach the skills that
            change how people work, earn and build.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-2">
        <Card className="border-border/70 bg-card/70">
          <CardContent className="p-8">
            <div className="flex size-11 items-center justify-center rounded-xl gradient-brand">
              <Target className="size-5 text-primary-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">Our mission</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              To equip individuals and businesses with practical artificial intelligence skills through
              affordable, hands-on training — so that our students do not just understand AI, they use it
              every day to create value, income and opportunity.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardContent className="p-8">
            <div className="flex size-11 items-center justify-center rounded-xl gradient-brand">
              <Eye className="size-5 text-primary-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">Our vision</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              To become Africa's most trusted AI skill training brand — a place where anyone, from any
              background, can gain the technology skills that make them competitive anywhere in the world.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Our practical approach</h2>
            <p className="mt-4 text-muted-foreground">
              Watching tutorials does not build skill. Doing the work does.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: "Learn by doing",
                body: "Every session includes live practice inside the actual AI tools, with real prompts and real output you keep.",
              },
              {
                icon: Handshake,
                title: "Mentor beside you",
                body: "Trainers stay reachable on WhatsApp through your cohort, so a small blocker never stalls your progress.",
              },
              {
                icon: Rocket,
                title: "Apply immediately",
                body: "Each course ends with a project drawn from your own work, business or studies — so the value is instant.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/70 bg-card/70">
                <CardContent className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Who we train</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {AUDIENCES.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-border/70 bg-card/60 p-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <item.icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-primary/40 bg-card/80 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">Ready to start?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Browse the course catalog or reach us directly at {SITE.email}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="gradient-brand text-primary-foreground">
              <Link to="/courses">View Courses</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
