import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpen,
  CreditCard,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/payments.functions";
import { PAYMENT_STATUSES, formatNaira } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Esonet Concept" },
      {
        name: "description",
        content:
          "Esonet Concept administration: courses, students, enrolments, payments and website settings.",
      },
      { property: "og:title", content: "Admin Dashboard — Esonet Concept" },
      { property: "og:description", content: "Manage courses, students, enrolments and payments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading, refetch } = useIsAdmin(user?.id);
  const claim = useServerFn(claimFirstAdmin);

  const claimMutation = useMutation({
    mutationFn: () => claim({ data: undefined as never }),
    onSuccess: async (result) => {
      if (result.ok) {
        toast.success("You now have administrator access.");
        await refetch();
      } else {
        toast.error(result.reason);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading || (user && roleLoading)) {
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
          <h1 className="text-2xl font-bold">Administrator sign in required</h1>
          <Button asChild className="mt-6">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <ShieldCheck className="size-10 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">You are not an administrator</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If no administrator has been set up yet, you can claim access once with the button below.
            After the first administrator exists, this stops working.
          </p>
          <Button
            className="mt-6"
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
          >
            {claimMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Claim administrator access
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return <AdminPanels />;
}

function AdminPanels() {
  const queryClient = useQueryClient();

  const courses = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const students = useQuery({
    queryKey: ["admin", "students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const enrollments = useQuery({
    queryKey: ["admin", "enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(title), profiles:user_id(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const payments = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totals = useMemo(() => {
    const rows = payments.data ?? [];
    const revenue = rows
      .filter((p) => p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount_ngn ?? 0), 0);
    return {
      revenue,
      pending: rows.filter((p) => p.status === "pending").length,
      successful: rows.filter((p) => p.status === "successful").length,
    };
  }, [payments.data]);

  const [studentSearch, setStudentSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");

  async function togglePublished(id: string, next: boolean) {
    const { error } = await supabase.from("courses").update({ is_published: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next ? "Course published" : "Course unpublished");
    await queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    await queryClient.invalidateQueries({ queryKey: ["courses", "published"] });
  }

  async function toggleStudentActive(id: string, next: boolean) {
    const { error } = await supabase.from("profiles").update({ is_active: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next ? "Account enabled" : "Account disabled");
    await queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
  }

  const filteredStudents = (students.data ?? []).filter((student) => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      student.full_name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.phone.toLowerCase().includes(term)
    );
  });

  const filteredPayments = (payments.data ?? []).filter((payment) => {
    const matchesStatus = paymentStatus === "all" || payment.status === paymentStatus;
    const term = paymentSearch.trim().toLowerCase();
    return matchesStatus && (!term || (payment.reference ?? "").toLowerCase().includes(term));
  });

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-hero-glow/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Courses, students, enrolments, payments and website settings in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label="Students" value={(students.data ?? []).length} />
          <Metric icon={BookOpen} label="Courses" value={(courses.data ?? []).length} />
          <Metric icon={ShieldCheck} label="Enrolments" value={(enrollments.data ?? []).length} />
          <Metric icon={TrendingUp} label="Revenue" value={formatNaira(totals.revenue)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Metric icon={CreditCard} label="Pending payments" value={totals.pending} />
          <Metric icon={CreditCard} label="Successful payments" value={totals.successful} />
        </div>

        <Tabs defaultValue="courses" className="mt-10">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="enrollments">Enrolments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6 space-y-3">
            {(courses.data ?? []).map((course) => (
              <Card key={course.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNaira(course.price_ngn)} · {course.duration} · {course.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.is_published ? "default" : "outline"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void togglePublished(course.id, !course.is_published)}
                    >
                      {course.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {courses.isLoading ? <Loader2 className="size-5 animate-spin" /> : null}
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Input
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Search by name, email or phone"
              className="max-w-sm"
            />
            <div className="mt-4 overflow-x-auto rounded-lg border border-border/70">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t border-border/60">
                      <td className="px-4 py-3">{student.full_name || "—"}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">{student.phone || "—"}</td>
                      <td className="px-4 py-3">{student.country || "—"}</td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant={student.is_active ? "secondary" : "outline"}
                          onClick={() => void toggleStudentActive(student.id, !student.is_active)}
                        >
                          {student.is_active ? "Enabled" : "Disabled"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="enrollments" className="mt-6">
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(enrollments.data ?? []).map((row) => {
                    const profile = row.profiles as unknown as
                      | { full_name: string; email: string }
                      | null;
                    const course = row.courses as unknown as { title: string } | null;
                    return (
                      <tr key={row.id} className="border-t border-border/60">
                        <td className="px-4 py-3">
                          {profile?.full_name || profile?.email || "—"}
                        </td>
                        <td className="px-4 py-3">{course?.title ?? "—"}</td>
                        <td className="px-4 py-3">{row.status}</td>
                        <td className="px-4 py-3">{row.progress}%</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString("en-NG")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="flex flex-wrap gap-2">
              <Input
                value={paymentSearch}
                onChange={(event) => setPaymentSearch(event.target.value)}
                placeholder="Search transaction reference"
                className="max-w-sm"
              />
              {["all", ...PAYMENT_STATUSES].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={paymentStatus === status ? "secondary" : "outline"}
                  onClick={() => setPaymentStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
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
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-mono text-xs">{payment.reference || "—"}</td>
                      <td className="px-4 py-3">{formatNaira(payment.amount_ngn)}</td>
                      <td className="px-4 py-3">{payment.status}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString("en-NG")}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No transactions match this filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
