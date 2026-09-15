import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers, MessageCircle } from "lucide-react";
import { useState } from "react";

import { CourseImage } from "@/components/CourseImage";
import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publishedCoursesQuery } from "@/lib/queries";
import { LEVELS, formatNaira, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "AI Training Courses & Prices in Naira — Esonet Concept" },
      {
        name: "description",
        content:
          "Explore Esonet Concept AI training courses: AI for Beginners, ChatGPT & Generative AI, AI for Business, AI Content Creation, AI Productivity Tools and Prompt Engineering. Prices in Naira.",
      },
      { property: "og:title", content: "AI Training Courses — Esonet Concept" },
      {
        property: "og:description",
        content: "Course durations, skill levels, curriculum modules and Naira pricing.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedCoursesQuery),
  component: Courses,
});

function Courses() {
  const { data: courses } = useSuspenseQuery(publishedCoursesQuery);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("All");

  const filtered = courses.filter((course) => {
    const matchesLevel = level === "All" || course.level === level;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      course.title.toLowerCase().includes(term) ||
      course.summary.toLowerCase().includes(term);
    return matchesLevel && matchesSearch;
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero-glow opacity-50" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <h1 className="text-4xl font-bold sm:text-5xl">AI Training Courses</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every course is hands-on, mentor-supported and priced in Naira. Choose your level, check the
            curriculum, and enroll in minutes.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses…"
              className="sm:max-w-xs"
              aria-label="Search courses"
            />
            <div className="flex flex-wrap gap-2">
              {["All", ...LEVELS].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    level === option
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card/60 p-12 text-center">
            <Layers className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No courses match your search yet. Message us on WhatsApp and we'll recommend one.
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <Card
                key={course.id}
                className="flex flex-col overflow-hidden border-border/70 bg-card/80 pt-0 transition-colors hover:border-primary/60"
              >
                <CourseImage path={course.cover_image_url} title={course.title} className="h-44 w-full" />
                <CardContent className="flex flex-1 flex-col px-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{course.level}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {course.duration}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-lg font-semibold">{course.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.summary}
                  </p>
                  <p className="mt-5 font-display text-2xl font-bold text-primary">
                    {formatNaira(course.price_ngn)}
                  </p>
                  <div className="mt-5 flex gap-2">
                    <Button asChild size="sm" variant="secondary" className="flex-1">
                      <Link to="/courses/$slug" params={{ slug: course.slug }}>
                        View details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 gradient-brand text-primary-foreground"
                    >
                      <Link to="/register" search={{ course: course.slug }}>
                        Enroll <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
