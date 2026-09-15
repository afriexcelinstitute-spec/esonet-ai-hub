-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- auto profile + student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- courses
CREATE TABLE public.courses (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  duration TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Beginner',
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins read all courses" ON public.courses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.course_modules (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads modules of published courses" ON public.course_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published = true));
CREATE POLICY "Admins read all modules" ON public.course_modules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage modules" ON public.course_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- enrollments
CREATE TABLE public.enrollments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students create own enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students update own enrollments" ON public.enrollments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- payments
CREATE TABLE public.payments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  amount_ngn NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'paystack',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students create own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- site settings (public readable, admin writable) - no secrets here
CREATE TABLE public.site_settings (
  id INTEGER NOT NULL PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name TEXT NOT NULL DEFAULT 'Esonet Concept AI Skill Training',
  contact_email TEXT NOT NULL DEFAULT 'info@esonetconcept.com',
  whatsapp_number TEXT NOT NULL DEFAULT '2347048200526',
  facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com/esonetconcept',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/esonetconcept',
  address TEXT NOT NULL DEFAULT '',
  paystack_public_key TEXT NOT NULL DEFAULT '',
  paystack_mode TEXT NOT NULL DEFAULT 'test',
  paystack_secret_set BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_settings (id) VALUES (1);

-- paystack secret: server-only, no anon/authenticated grants
CREATE TABLE public.payment_secrets (
  id INTEGER NOT NULL PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paystack_secret_key TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_secrets TO service_role;
ALTER TABLE public.payment_secrets ENABLE ROW LEVEL SECURITY;
INSERT INTO public.payment_secrets (id) VALUES (1);

-- contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage messages" ON public.contact_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- seed courses
INSERT INTO public.courses (slug, title, summary, description, price_ngn, duration, level, is_published, is_featured) VALUES
('ai-for-beginners', 'AI for Beginners', 'Start from zero and understand how artificial intelligence really works.', 'A friendly, hands-on introduction to artificial intelligence for absolute beginners. You will learn what AI is, how modern AI tools work, and how to use them confidently in everyday work and study. No coding or technical background required.', 45000.00, '4 weeks', 'Beginner', true, true),
('chatgpt-generative-ai', 'ChatGPT & Generative AI', 'Master ChatGPT and generative AI tools for real work output.', 'Go deep on ChatGPT and the wider generative AI landscape. You will learn to write effective prompts, generate documents, images and ideas, automate repetitive writing, and build reliable AI workflows you can use daily.', 60000.00, '5 weeks', 'Beginner', true, true),
('ai-for-business', 'AI for Business', 'Use AI to grow sales, cut cost and make better decisions.', 'Built for entrepreneurs, managers and business owners. Learn how to apply AI to marketing, customer service, sales, operations and reporting, and how to choose the right tools without wasting money.', 85000.00, '6 weeks', 'Intermediate', true, true),
('ai-content-creation', 'AI Content Creation', 'Create scroll-stopping content with AI in a fraction of the time.', 'Produce social media posts, videos, voiceovers, graphics and blog content with AI. Covers content strategy, brand voice, image and video generation tools, editing workflows and monetising your content skills.', 70000.00, '5 weeks', 'Beginner', true, true),
('ai-productivity-tools', 'AI Productivity Tools', 'Automate your day with the best AI productivity stack.', 'A practical tour of the AI tools that save the most time: meeting notes, email drafting, research, spreadsheets, presentations, scheduling and task automation. You finish with a personal automation system.', 55000.00, '4 weeks', 'Beginner', true, false),
('prompt-engineering', 'Prompt Engineering', 'Write prompts that get expert-level results every time.', 'The craft of talking to AI models. Learn prompt patterns, context design, role prompting, chaining, structured outputs, evaluation and troubleshooting so you can get consistent, professional results from any AI model.', 90000.00, '6 weeks', 'Advanced', true, true);

INSERT INTO public.course_modules (course_id, title, description, position)
SELECT c.id, m.title, m.description, m.position FROM public.courses c
JOIN (VALUES
('ai-for-beginners', 'What AI Really Is', 'Plain-language foundations: machine learning, models, data and limitations.', 1),
('ai-for-beginners', 'Your First AI Tools', 'Setting up and safely using ChatGPT, Gemini and other assistants.', 2),
('ai-for-beginners', 'Everyday AI Tasks', 'Writing, summarising, translating, planning and research with AI.', 3),
('ai-for-beginners', 'Safety, Ethics & Accuracy', 'Spotting AI mistakes, protecting data and using AI responsibly.', 4),
('ai-for-beginners', 'Your AI Action Plan', 'Build a personal plan to keep learning and applying AI skills.', 5),
('chatgpt-generative-ai', 'Inside Generative AI', 'How text, image and audio generation actually work.', 1),
('chatgpt-generative-ai', 'Prompting Fundamentals', 'Structure, context and instructions that produce great answers.', 2),
('chatgpt-generative-ai', 'Documents & Data', 'Working with files, long documents and custom instructions.', 3),
('chatgpt-generative-ai', 'Images, Audio & Video', 'Generating and editing visual and audio assets.', 4),
('chatgpt-generative-ai', 'Building AI Workflows', 'Chaining tools together into repeatable processes.', 5),
('ai-for-business', 'AI Opportunity Mapping', 'Find where AI creates real value in your business.', 1),
('ai-for-business', 'AI Marketing & Sales', 'Campaigns, copy, lead research and follow-up automation.', 2),
('ai-for-business', 'Customer Service with AI', 'Chat assistants, WhatsApp support and response templates.', 3),
('ai-for-business', 'Operations & Reporting', 'Spreadsheets, dashboards, forecasting and documentation.', 4),
('ai-for-business', 'Cost, Risk & Governance', 'Budgets, data privacy and staff policies for AI use.', 5),
('ai-for-business', 'Your 90-Day AI Roadmap', 'A concrete rollout plan for your team.', 6),
('ai-content-creation', 'Content Strategy with AI', 'Audience, offers, content pillars and calendars.', 1),
('ai-content-creation', 'Copy That Converts', 'Hooks, captions, scripts and brand voice.', 2),
('ai-content-creation', 'AI Images & Design', 'Generating branded graphics and product visuals.', 3),
('ai-content-creation', 'AI Video & Voice', 'Short-form video, voiceovers, subtitles and editing.', 4),
('ai-content-creation', 'Publishing & Monetising', 'Scheduling, analytics and earning from content skills.', 5),
('ai-productivity-tools', 'Audit Your Time', 'Find the tasks worth automating first.', 1),
('ai-productivity-tools', 'Writing & Email', 'Drafting, replies, tone control and templates.', 2),
('ai-productivity-tools', 'Meetings & Research', 'Transcription, notes, summaries and fast research.', 3),
('ai-productivity-tools', 'Docs, Sheets & Slides', 'Reports, analysis and presentations at speed.', 4),
('ai-productivity-tools', 'Automation Systems', 'Connecting tools so work happens without you.', 5),
('prompt-engineering', 'How Models Interpret Prompts', 'Tokens, context windows and model behaviour.', 1),
('prompt-engineering', 'Core Prompt Patterns', 'Role, few-shot, chain-of-thought and constraint prompting.', 2),
('prompt-engineering', 'Structured Outputs', 'JSON, tables and formats you can build on.', 3),
('prompt-engineering', 'Prompt Chaining & Agents', 'Multi-step reasoning and tool use.', 4),
('prompt-engineering', 'Testing & Evaluation', 'Measuring quality and reducing hallucination.', 5),
('prompt-engineering', 'Professional Prompt Projects', 'Build a portfolio of production-ready prompts.', 6)
) AS m(slug, title, description, position) ON m.slug = c.slug;