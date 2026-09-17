import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, CreditCard, Loader2, MessageCircle } from "lucide-react";

import { CourseImage } from "@/components/CourseImage";
import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Learning Dashboard — Esonet Concept" },
      {
        name: "description",
        content:
          "Track your enrolled AI courses, curriculum modules, payment status and training progress with Esonet Concept.",
      },
      { property: "og:title", content: "My Learning Dashboard — Esonet Concept" },
      {
        property: "og:description",
        content: "Your enrolled AI courses, modules, payment status and progress.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const STATUS_TONE: Record<string, string> = {
  successful: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

function Dashboard() {
  const { user, loading } = useSession();
  const { data: profile } = useProfile(user?.id);
  const queryClient = useQueryClient();

  const enrollments = useQuery({
    queryKey: ["my-enrollments", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(*, course_modules(*))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const payments = useQuery({
    queryKey: ["my-payments", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setProgress(enrollmentId: string, progress: number) {
    await supabase.from("enrollments").update({ progress }).eq("id", enrollmentId);
    await queryClient.invalidateQueries({ queryKey: ["my-enrollments", user?.id] });
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold">Sign in to view your dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your enrolled courses, modules and payment status live here.
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const list = enrollments.data ?? [];
  const paymentFor = (enrollmentId: string) =>
    (payments.data ?? []).find((p) => p.enrollment_id === enrollmentId);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-hero-glow/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            {profile?.full_name || user.email}
          </h1>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div>Email: {profile?.email || user.email}</div>
            {profile?.phone ? <div>WhatsApp: {profile.phone}</div> : null}
            {profile?.country ? <div>Country: {profile.country}</div> : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">My courses</h2>
          <Button asChild variant="secondary" size="sm">
            <Link to="/courses">Browse more courses</Link>
          </Button>
        </div>

        {enrollments.isLoading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <BookOpen className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground">You have not enrolled in a course yet.</p>
              <Button asChild>
                <Link to="/courses">View courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-6">
            {list.map((enrollment) => {
              const course = enrollment.courses as unknown as
                | {
                    title: string;
                    slug: string;
                    duration: string;
                    level: string;
                    price_ngn: number;
                    cover_image_url: string | null;
                    course_modules: { id: string; title: string; description: string; position: number }[];
                  }
                | null;
              const payment = paymentFor(enrollment.id);
              const status = payment?.status ?? "pending";
              const modules = [...(course?.course_modules ?? [])].sort(
                (a, b) => a.position - b.position,
              );

              return (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                    <CourseImage
                      path={course?.cover_image_url ?? null}
                      alt={course?.title ?? "Course cover"}
                      className="h-40 w-full object-cover md:h-full"
                    />
                    <div>
                      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{course?.title}</CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3.5" /> {course?.duration}
                            </span>
                            <span>{course?.level}</span>
                            <span>{formatNaira(course?.price_ngn)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={STATUS_TONE[status]}>
                          Payment: {status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Training progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="mt-2" />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[25, 50, 75, 100].map((value) => (
                              <Button
                                key={value}
                                size="sm"
                                variant={enrollment.progress >= value ? "secondary" : "outline"}
                                onClick={() => void setProgress(enrollment.id, value)}
                              >
                                {value}%
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold">Course materials</h3>
                          <ul className="mt-2 space-y-2">
                            {modules.map((module) => (
                              <li key={module.id} className="flex gap-2 text-sm">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                <span>
                                  <span className="font-medium">{module.title}</span>
                                  {module.description ? (
                                    <span className="block text-xs text-muted-foreground">
                                      {module.description}
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            ))}
                            {modules.length === 0 ? (
                              <li className="text-sm text-muted-foreground">
                                Modules for this course are being published.
                              </li>
                            ) : null}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {course?.slug ? (
                            <Button asChild size="sm" variant="secondary">
                              <Link to="/courses/$slug" params={{ slug: course.slug }}>
                                Course page
                              </Link>
                            </Button>
                          ) : null}
                          {status !== "successful" ? (
                            <Button asChild size="sm" variant="outline">
                              <a
                                href={whatsappLink(
                                  `Hello Esonet Concept, I want to complete payment for ${course?.title ?? "my course"}.`,
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="size-4" /> Arrange payment on WhatsApp
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-xl font-semibold">Payment history</h2>
        {(payments.data ?? []).length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
              <CreditCard className="size-5" /> No transactions recorded yet.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {(payments.data ?? []).map((payment) => (
                  <tr key={payment.id} className="border-t border-border/60">
                    <td className="px-4 py-3 font-mono text-xs">{payment.reference || "—"}</td>
                    <td className="px-4 py-3">{formatNaira(payment.amount_ngn)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_TONE[payment.status]}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
