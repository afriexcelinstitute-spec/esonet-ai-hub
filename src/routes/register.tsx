import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { publishedCoursesQuery } from "@/lib/queries";
import { COUNTRIES, formatNaira, whatsappLink } from "@/lib/site";

export const PENDING_COURSE_KEY = "esonet_pending_course";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    course: typeof search.course === "string" ? search.course : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Register & Enroll — Esonet Concept AI Skill Training" },
      {
        name: "description",
        content:
          "Create your Esonet Concept student account, choose your AI training course and secure your seat in the next cohort.",
      },
      { property: "og:title", content: "Register & Enroll — Esonet Concept" },
      { property: "og:description", content: "Student registration for AI skill training courses." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(publishedCoursesQuery),
  component: Register,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter your phone / WhatsApp number")
    .max(25)
    .regex(/^[0-9+()\s-]+$/, "Phone number can only contain digits and + ( ) -"),
  courseId: z.string().uuid("Select a course"),
  country: z.string().trim().min(2, "Select your country").max(60),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function Register() {
  const { course: courseSlug } = Route.useSearch();
  const { data: courses } = useSuspenseQuery(publishedCoursesQuery);
  const navigate = useNavigate();

  const preselected = courses.find((c) => c.slug === courseSlug);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [courseId, setCourseId] = useState(preselected?.id ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const selected = courses.find((c) => c.id === courseId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ fullName, email, phone, courseId, country, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          country: parsed.data.country,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Remember the chosen course so the enrolment is created as soon as the
    // student has an active session (immediately, or after email confirmation).
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PENDING_COURSE_KEY, parsed.data.courseId);
    }

    if (data.session) {
      await supabase
        .from("enrollments")
        .insert({ user_id: data.session.user.id, course_id: parsed.data.courseId, status: "pending" });
      window.localStorage.removeItem(PENDING_COURSE_KEY);
      setLoading(false);
      toast.success("Registration complete. Welcome to Esonet Concept!");
      navigate({ to: "/dashboard" });
      return;
    }

    setLoading(false);
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <SiteLayout>
        <div className="mx-auto w-full max-w-lg px-4 py-24 text-center sm:px-6">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h1 className="mt-6 text-3xl font-bold">Check your email</h1>
          <p className="mt-4 text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it to
            activate your account — your selected course will be waiting in your dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary">
              <Link to="/auth">Go to sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={whatsappLink("Hello Esonet Concept, I just registered for a course.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow opacity-50" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="border-border/70 bg-card/85 shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Student registration</CardTitle>
              <CardDescription>
                Create your account and reserve your seat. It takes about two minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Chinedu Okeke"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+234 704 820 0526"
                      maxLength={25}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course">Selected course</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Choose your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    maxLength={72}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full gradient-brand text-primary-foreground"
                >
                  {loading ? "Creating your account…" : "Create account & enroll"}
                </Button>

                <p className="text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link to="/auth" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle className="font-display text-lg">Your selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {selected ? (
                  <>
                    <p className="font-display text-lg font-semibold text-foreground">{selected.title}</p>
                    <p className="text-muted-foreground">{selected.summary}</p>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{selected.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span>{selected.level}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-muted-foreground">Tuition</span>
                      <span className="font-display text-lg font-bold text-primary">
                        {formatNaira(selected.price_ngn)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Choose a course to see the duration, level and tuition here.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/70">
              <CardContent className="p-6 text-sm text-muted-foreground">
                <p className="font-display text-base font-semibold text-foreground">Need help deciding?</p>
                <p className="mt-2">
                  Send us a message and a trainer will recommend the right course for your goal.
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" /> Chat on WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
