import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Clock,
  GraduationCap,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { CourseImage } from "@/components/CourseImage";
import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/esonet-logo.png.asset.json";
import { publishedCoursesQuery } from "@/lib/queries";
import { formatNaira, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Esonet Concept AI Skill Training — Master AI Skills. Build Your Future" },
      {
        name: "description",
        content:
          "Hands-on AI skill training in Nigeria for beginners, professionals, entrepreneurs and students. Learn ChatGPT, generative AI, prompt engineering, AI for business and more.",
      },
      { property: "og:title", content: "Master AI Skills. Build Your Future — Esonet Concept" },
      {
        property: "og:description",
        content: "Practical, mentor-led AI training with real projects. Enroll today and start building with AI.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedCoursesQuery),
  component: Home,
});

const REASONS = [
  {
    icon: BrainCircuit,
    title: "Practical, not theoretical",
    body: "Every module ends with a real task you complete using live AI tools, so the skill sticks.",
  },
  {
    icon: Users,
    title: "Built for every level",
    body: "Complete beginners, working professionals, entrepreneurs and students all have a clear path.",
  },
  {
    icon: ShieldCheck,
    title: "Mentor support",
    body: "Direct access to trainers on WhatsApp throughout your training — never stuck alone.",
  },
  {
    icon: Rocket,
    title: "Career and business ready",
    body: "Finish with a portfolio, an automation system and the confidence to charge for your skills.",
  },
];

const STEPS = [
  { title: "Choose your course", body: "Browse the catalog and pick the training that matches your goal." },
  { title: "Register", body: "Create your student account in under two minutes." },
  { title: "Secure your seat", body: "Pay in Naira and get instant access to your student dashboard." },
  { title: "Train hands-on", body: "Work through the modules with live tools and mentor guidance." },
  { title: "Build & apply", body: "Complete your project and start using AI in work or business." },
];

function Home() {
  const { data: courses } = useSuspenseQuery(publishedCoursesQuery);
  const featured = courses.filter((c) => c.is_featured).slice(0, 6);
  const list = featured.length > 0 ? featured : courses.slice(0, 6);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero-glow opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-6 gap-2 rounded-full px-3 py-1.5 text-xs">
              <Sparkles className="size-3.5" /> AI skill training for Africa's next builders
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Master AI Skills.{" "}
              <span className="text-gradient-brand">Build Your Future</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Esonet Concept turns curiosity about artificial intelligence into real, income-earning
              skill. Practical courses, live tools, expert mentors and pricing in Naira — designed for
              beginners, professionals, entrepreneurs and students.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-brand text-primary-foreground shadow-glow">
                <Link to="/courses">
                  View Courses <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">Enroll Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-success/60 text-success">
                <a href={whatsappLink("Hello Esonet Concept, I'd like to enroll for AI training.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { label: "Courses", value: `${courses.length}+` },
                { label: "Skill levels", value: "3" },
                { label: "Mentor support", value: "6 days" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</dt>
                  <dd className="font-display text-2xl font-bold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] gradient-brand opacity-20 blur-3xl" aria-hidden />
            <Card className="relative overflow-hidden border-border/70 bg-card/80 shadow-card backdrop-blur">
              <CardContent className="p-8 text-center">
                <img
                  src={logo.url}
                  alt="Esonet Concept AI Skill Training globe logo"
                  className="mx-auto h-28 w-auto"
                />
                <h2 className="mt-6 font-display text-xl font-semibold">
                  Learn AI the way you'll actually use it
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Live tools. Real tasks. Naira pricing. Certificate on completion.
                </p>
                <ul className="mt-6 space-y-3 text-left text-sm">
                  {[
                    "No coding background required",
                    "Weekend and evening-friendly schedules",
                    "Downloadable materials and prompt libraries",
                    "WhatsApp mentor group for every cohort",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">AI is the new literacy</h2>
          <p className="mt-4 text-muted-foreground">
            The people who thrive over the next decade will not be the ones who fear AI — they will be
            the ones who know how to direct it. Esonet Concept gives you that ability in weeks, not years.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "For students",
              body: "Research faster, write better and graduate with a skill employers are actively hiring for.",
            },
            {
              icon: Rocket,
              title: "For entrepreneurs",
              body: "Market, sell and serve customers with a lean AI-powered team — even if that team is just you.",
            },
            {
              icon: BrainCircuit,
              title: "For professionals",
              body: "Automate the busywork, deliver more in less time and become the AI go-to person at work.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/70 bg-card/70">
              <CardContent className="p-6">
                <div className="flex size-11 items-center justify-center rounded-xl gradient-brand">
                  <item.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Featured courses</h2>
              <p className="mt-2 text-muted-foreground">Pick a track and start this cohort.</p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/courses">
                All courses <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((course) => (
              <Card
                key={course.id}
                className="group flex flex-col overflow-hidden border-border/70 bg-card/80 pt-0 transition-colors hover:border-primary/60"
              >
                <CourseImage path={course.cover_image_url} title={course.title} className="h-40 w-full" />
                <CardContent className="flex flex-1 flex-col px-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{course.level}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {course.duration}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.summary}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-display text-xl font-bold text-primary">
                      {formatNaira(course.price_ngn)}
                    </span>
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/courses/$slug" params={{ slug: course.slug }}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Why choose Esonet Concept</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex gap-4 rounded-xl border border-border/70 bg-card/60 p-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <reason.icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{reason.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How the training works</h2>
            <p className="mt-4 text-muted-foreground">Five simple steps from curious to capable.</p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-border/70 bg-card/70 p-6">
                <span className="flex size-9 items-center justify-center rounded-full gradient-brand font-display text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/80 p-10 text-center shadow-glow sm:p-14">
          <div className="absolute inset-0 bg-hero-glow opacity-60" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Your AI future starts this week</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Seats per cohort are limited so every student gets mentor attention. Register now or send us
              a message on WhatsApp and we'll help you choose the right course.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="gradient-brand text-primary-foreground">
                <Link to="/register">Enroll Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={whatsappLink("Hello Esonet Concept, please help me choose an AI course.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
