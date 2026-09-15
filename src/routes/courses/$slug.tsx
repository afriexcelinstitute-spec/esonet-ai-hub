import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Clock, MessageCircle, Signal } from "lucide-react";

import { CourseImage } from "@/components/CourseImage";
import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { courseBySlugQuery } from "@/lib/queries";
import { formatNaira, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ context, params }) => {
    const course = await context.queryClient.ensureQueryData(courseBySlugQuery(params.slug));
    if (!course) throw notFound();
    return { title: course.title, summary: course.summary };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Course unavailable — Esonet Concept" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — Esonet Concept AI Skill Training` },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: `${loaderData.title} — Esonet Concept` },
        { property: "og:description", content: loaderData.summary },
      ],
    };
  },
  notFoundComponent: CourseNotFound,
  component: CourseDetail,
});

function CourseNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="text-3xl font-bold">Course not found</h1>
        <p className="mt-3 text-muted-foreground">
          This course may have been unpublished. Browse the full catalog instead.
        </p>
        <Button asChild className="mt-6" variant="secondary">
          <Link to="/courses">All courses</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}

function CourseDetail() {
  const { slug } = Route.useParams();
  const { data: course } = useSuspenseQuery(courseBySlugQuery(slug));

  if (!course) return <CourseNotFound />;

  const modules = [...(course.course_modules ?? [])].sort((a, b) => a.position - b.position);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-hero-glow opacity-50" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to courses
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Signal className="size-3.5" /> {course.level}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3.5" /> {course.duration}
                </Badge>
              </div>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{course.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{course.summary}</p>
              <p className="mt-6 leading-relaxed text-muted-foreground">{course.description}</p>
            </div>

            <Card className="h-fit overflow-hidden border-border/70 bg-card/85 pt-0 shadow-card">
              <CourseImage path={course.cover_image_url} title={course.title} className="h-40 w-full" />
              <CardContent className="px-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Tuition</p>
                <p className="mt-1 font-display text-3xl font-bold text-primary">
                  {formatNaira(course.price_ngn)}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {[
                    `${modules.length} curriculum modules`,
                    `${course.duration} of guided training`,
                    "Mentor support on WhatsApp",
                    "Certificate on completion",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-muted-foreground">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Button asChild className="gradient-brand text-primary-foreground">
                    <Link to="/register" search={{ course: course.slug }}>
                      Enroll Now
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={whatsappLink(`Hello Esonet Concept, I'm interested in the ${course.title} course.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" /> Ask a question
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Curriculum</h2>
        <p className="mt-2 text-muted-foreground">What you will cover, module by module.</p>
        <ol className="mt-8 space-y-4">
          {modules.map((module, index) => (
            <li key={module.id} className="flex gap-4 rounded-xl border border-border/70 bg-card/60 p-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">{module.title}</h3>
                {module.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                )}
              </div>
            </li>
          ))}
          {modules.length === 0 && (
            <li className="rounded-xl border border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
              The detailed module breakdown for this course is being finalised. Message us on WhatsApp for
              the outline.
            </li>
          )}
        </ol>
      </section>
    </SiteLayout>
  );
}
