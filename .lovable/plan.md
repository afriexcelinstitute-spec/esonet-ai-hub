# Esonet Concept AI Skill Training — Website & Web App

A full training platform: public marketing site, course catalog, student enrolment and dashboard, and an admin back office. Prices in Naira (₦), WhatsApp contact throughout, and your globe logo used across the header, hero and footer.

## Public pages

- **Home** — AI-tech hero "Master AI Skills. Build Your Future", value proposition, buttons for View Courses / Enroll Now / Chat on WhatsApp (wa.me/2347048200526), featured courses, "Why Choose Esonet Concept", a step-by-step training process, a closing call-to-action banner, and a full footer with contact and social links.
- **About Us** — mission, vision, and the practical approach for beginners, professionals, entrepreneurs and students.
- **Courses** — catalog pulled live from the database, showing price in ₦, duration and skill level.
- **Course details** — full description, curriculum modules, cover image, and an Enroll button.
- **Registration / Enrolment** — Full Name, Email, Phone/WhatsApp, Selected Course, Country, Password. Creates the student account and the enrolment.
- **Contact** — contact form saved for admin review, plus direct email and WhatsApp links. A floating WhatsApp chat button on every page.

## Student dashboard

Welcome view with profile details, enrolled courses, payment status per enrolment, course modules/materials, and a simple progress indicator per course.

## Admin dashboard

- **Overview** — total students, courses, enrolments, revenue, pending and successful payments.
- **Courses** — add, edit, delete, publish/unpublish, set ₦ price, manage modules, upload cover images.
- **Students & enrolments** — searchable list, enrolment review, enable/disable accounts.
- **Payments** — transaction log with search and status filter (Pending, Successful, Failed, Refunded), references, and revenue totals.
- **Settings** — business info, contact details, social links, and Paystack keys (public key, secret key stored securely, Test/Live toggle).

## Payments

Paystack is prepared but not active. Until keys are saved, the enrolment payment step shows a clear "Payment configuration required" notice with a WhatsApp link to arrange payment manually — no fake or simulated payments. Once you add your keys in Admin Settings, live checkout can be switched on.

## Design

Dark, modern AI-tech look built from the logo's electric blue and violet, with a clean light mode for reading-heavy pages. Fully responsive on mobile, tablet and desktop.

## Technical notes

- Lovable Cloud enabled for database, accounts, and file storage.
- Tables: `profiles`, `user_roles` (admin/student, separate table for security), `courses`, `course_modules`, `enrollments`, `payments`, `site_settings`, `contact_messages`. Row-level security on all of them: public read for published courses only, students read their own data, admins full access.
- Storage bucket for course cover images.
- Email/password sign-in enabled; admin area gated by role, not by client-side flags.
- Paystack secret key held as a backend secret, never exposed to the browser; server functions handle initialisation and verification once keys exist.
- Seed data: the six starter courses (AI for Beginners, ChatGPT & Generative AI, AI for Business, AI Content Creation, AI Productivity Tools, Prompt Engineering) with modules and pricing, so the site is populated from day one.

## What I need from you later

- Paystack public and secret keys to activate payments.
- Real course prices and durations if the seeded ones need changing.
- The first admin account email so I can grant admin rights.
