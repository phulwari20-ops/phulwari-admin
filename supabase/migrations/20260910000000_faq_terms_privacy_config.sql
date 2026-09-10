-- ==============================================================================
-- MIGRATION: Dynamic Configuration for FAQ, Terms & Conditions, and Privacy Policy
-- ==============================================================================

-- 1. FAQ PAGE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.faq_page_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  badge_text TEXT DEFAULT 'FAQ',
  hero_title TEXT DEFAULT 'Find Answers to',
  hero_highlight TEXT DEFAULT 'Common Questions',
  hero_subtitle TEXT DEFAULT 'We understand parents may have questions before enrolling their child or joining our programs — here are answers to the most frequently asked ones.',
  faqs JSONB DEFAULT '[]'::jsonb,
  cta_section JSONB DEFAULT '{"title": "Still Have Questions?", "subtitle": "Our team is here to guide you every step of the way.", "phone": "+916207368839", "whatsapp": "916207368839"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow public read and anon/authenticated writes
ALTER TABLE public.faq_page_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on faq_page_config" ON public.faq_page_config;
CREATE POLICY "Allow public read on faq_page_config" ON public.faq_page_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert/update on faq_page_config" ON public.faq_page_config;
CREATE POLICY "Allow public insert/update on faq_page_config" ON public.faq_page_config FOR ALL USING (true) WITH CHECK (true);


-- 2. TERMS & CONDITIONS PAGE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.terms_page_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  badge_text TEXT DEFAULT 'Legal',
  last_updated TEXT DEFAULT 'June 2026',
  title_part1 TEXT DEFAULT 'Terms &',
  title_highlight TEXT DEFAULT 'Conditions',
  intro_text TEXT DEFAULT 'Welcome to Phulwari – Mother & Child Activity Centre. By enrolling in our programs, participating in activities, using our website, or accessing our services, you agree to comply with the terms laid out below. Please read them carefully.',
  sections JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{"address": "M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001", "phone": "+91 6207368839", "email": "phulwari02@gmail.com"}'::jsonb,
  closing_banner JSONB DEFAULT '{"title": "Thank You for Being Part of the Phulwari Family", "subtitle": "We are committed to creating a safe, joyful, and enriching environment where children learn, play, and grow while families build lasting memories together.", "phone": "+916207368839", "whatsapp": "916207368839"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow public read and anon/authenticated writes
ALTER TABLE public.terms_page_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on terms_page_config" ON public.terms_page_config;
CREATE POLICY "Allow public read on terms_page_config" ON public.terms_page_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert/update on terms_page_config" ON public.terms_page_config;
CREATE POLICY "Allow public insert/update on terms_page_config" ON public.terms_page_config FOR ALL USING (true) WITH CHECK (true);


-- 3. PRIVACY POLICY PAGE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.privacy_page_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  badge_text TEXT DEFAULT 'Privacy Policy',
  last_updated TEXT DEFAULT 'June 2026',
  title_part1 TEXT DEFAULT 'Your',
  title_highlight TEXT DEFAULT 'Privacy',
  title_part2 TEXT DEFAULT 'Matters',
  intro_text TEXT DEFAULT 'At Phulwari – Mother & Child Activity Centre, we value the privacy and trust of every child, parent, guardian, and visitor. This policy explains how we collect, use, and protect your personal information.',
  sections JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{"address": "M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001", "phone": "+91 6207368839", "email": "phulwari02@gmail.com"}'::jsonb,
  closing_banner JSONB DEFAULT '{"title": "Your Privacy is in Safe Hands", "subtitle": "At Phulwari, we are committed to maintaining the privacy, safety, and trust of every child and family who becomes part of our community.", "phone": "+916207368839", "whatsapp": "916207368839"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow public read and anon/authenticated writes
ALTER TABLE public.privacy_page_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on privacy_page_config" ON public.privacy_page_config;
CREATE POLICY "Allow public read on privacy_page_config" ON public.privacy_page_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert/update on privacy_page_config" ON public.privacy_page_config;
CREATE POLICY "Allow public insert/update on privacy_page_config" ON public.privacy_page_config FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- PRE-SEEDING INITIAL LIVE DATA FOR INSTANT DYNAMIC ACCESS
-- ==============================================================================

-- Seed FAQ Data
INSERT INTO public.faq_page_config (id, badge_text, hero_title, hero_highlight, hero_subtitle, faqs)
VALUES (
  1,
  'FAQ',
  'Find Answers to',
  'Common Questions',
  'We understand parents may have questions before enrolling their child or joining our programs — here are answers to the most frequently asked ones.',
  '[
    {
      "id": "faq-1",
      "icon": "HelpCircle",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "question": "What is Phulwari Mother & Child Activity Centre?",
      "answer": "Phulwari is a unique activity centre where children can learn, play, explore and develop through engaging activities, while mothers can participate in dedicated fitness programs and family-oriented experiences."
    },
    {
      "id": "faq-2",
      "icon": "Baby",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "question": "What is the minimum age for admission?",
      "answer": "Children aged 3 years and above can join our regular activity programs and batches. For younger children, we offer our special Mother & Toddler Program designed for toddlers and their mothers."
    },
    {
      "id": "faq-3",
      "icon": "Music4",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "question": "What activities are available at Phulwari?",
      "answer": "Music Classes, Dance Classes, Gymnastics, MMA Training, Roller Skating, Art & Craft, Cricket Training, Yoga, Play Zone Activities, Mother & Toddler Program, Fitness Program for Mothers."
    },
    {
      "id": "faq-4",
      "icon": "Dumbbell",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "question": "Do you have programs for mothers?",
      "answer": "Yes. We offer a dedicated Fitness Program for Mothers that helps mothers stay active, healthy and energetic while their children participate in activities."
    },
    {
      "id": "faq-5",
      "icon": "Sparkles",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "question": "What programs and batches are available?",
      "answer": "1. Phulwari Premium Circle (5:00 PM Onwards, Mon-Sun, 3+ Years)\n2. Phulwari Core (6:30 PM Onwards, Wed-Sun, 3+ Years)\n3. Mother & Toddler Program (10:30 AM - 11:30 AM, Mon-Sat, 1-3 Years)"
    },
    {
      "id": "faq-6",
      "icon": "ShieldCheck",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "question": "Is the environment safe for children?",
      "answer": "Absolutely. Child safety and well-being are our highest priorities. We provide a secure, clean, hygienic and child-friendly environment with trained instructors and staff."
    },
    {
      "id": "faq-7",
      "icon": "Cake",
      "color": "#FF8A3D",
      "bg": "#FFEADB",
      "question": "How You Organise Birthday ?",
      "answer": "Theme Decorations, Fun Activities, Entertainment, Customized Packages, Photo-Friendly Setups."
    },
    {
      "id": "faq-8",
      "icon": "Tent",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "question": "Do you organize Summer Camps?",
      "answer": "Dance, Music, Art & Craft, Sports & Games, Fitness Activities, Personality Development Sessions."
    },
    {
      "id": "faq-9",
      "icon": "Snowflake",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "question": "Do you organize Winter Camps?",
      "answer": "Creative Learning, Art & Craft, Fitness Activities, Sports & Games, Team Building Activities, Fun Competitions."
    },
    {
      "id": "faq-10",
      "icon": "Eye",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "question": "Can parents visit the centre before enrollment?",
      "answer": "Yes. Parents are welcome to visit our centre, explore the facilities, meet our team and understand the programs before enrollment."
    },
    {
      "id": "faq-11",
      "icon": "ClipboardCheck",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "question": "How can I enroll my child?",
      "answer": "1. Call Us (+91 6207368839)\n2. Contact Us on WhatsApp\n3. Visit the Centre Directly\n4. Complete the Admission Process"
    },
    {
      "id": "faq-12",
      "icon": "Settings2",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "question": "Are customized activity options available?",
      "answer": "Yes. Customized activity options are available under Phulwari Premium Circle, subject to availability and requirements."
    },
    {
      "id": "faq-13",
      "icon": "Gamepad2",
      "color": "#FF8A3D",
      "bg": "#FFEADB",
      "question": "Do you have a Play Zone?",
      "answer": "Yes. We provide a safe, clean and enjoyable Play Zone where children can play, interact and have fun in a supervised environment."
    },
    {
      "id": "faq-14",
      "icon": "Trophy",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "question": "Do you conduct special events and competitions?",
      "answer": "Competitions, Talent Shows, Celebrations, Children''s Events, Family Engagement Activities."
    },
    {
      "id": "faq-15",
      "icon": "Clock3",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "question": "What are your operating hours?",
      "answer": "Activities generally begin from 5:00 PM onwards and continue according to the selected batch schedule. For the latest timings and updates, please contact us directly."
    },
    {
      "id": "faq-16",
      "icon": "MapPin",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "question": "Where is Phulwari located?",
      "answer": "M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri Main Road, Patna, Bihar – 800001"
    },
    {
      "id": "faq-17",
      "icon": "Phone",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "question": "How can I contact Phulwari?",
      "answer": "+91 6207368839 | WhatsApp Support Available | Visit Our Centre"
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  badge_text = EXCLUDED.badge_text,
  hero_title = EXCLUDED.hero_title,
  hero_highlight = EXCLUDED.hero_highlight,
  hero_subtitle = EXCLUDED.hero_subtitle,
  faqs = EXCLUDED.faqs,
  updated_at = NOW();


-- Seed Terms & Conditions Data
INSERT INTO public.terms_page_config (id, badge_text, last_updated, title_part1, title_highlight, intro_text, sections)
VALUES (
  1,
  'Legal',
  'June 2026',
  'Terms &',
  'Conditions',
  'Welcome to Phulwari – Mother & Child Activity Centre. By enrolling in our programs, participating in activities, using our website, or accessing our services, you agree to comply with the terms laid out below. Please read them carefully.',
  '[
    {
      "id": "about",
      "num": "01",
      "label": "About Phulwari",
      "icon": "Sparkles",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "content": "Phulwari – Mother & Child Activity Centre is dedicated to providing educational, recreational, fitness, creative, and developmental programs for children and parents."
    },
    {
      "id": "eligibility",
      "num": "02",
      "label": "Eligibility",
      "icon": "UserCheck",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "content": "Children must be enrolled by a parent or legal guardian who is at least 18 years of age.\nParents and guardians are responsible for providing accurate, complete, and up-to-date information during registration and enrollment."
    },
    {
      "id": "registration",
      "num": "03",
      "label": "Registration & Enrollment",
      "icon": "ClipboardList",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "content": "Admission to any program is subject to seat availability.\nEnrollment will be confirmed only after successful fee payment, submission of documents, and verification.",
      "bullets": [
        "Successful payment of applicable fees",
        "Submission of required documents",
        "Verification of registration details"
      ]
    },
    {
      "id": "fees",
      "num": "04",
      "label": "Fees & Payments",
      "icon": "Wallet",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "content": "All program fees must be paid in advance unless otherwise specified.\nParents are responsible for ensuring timely payment of all applicable charges.",
      "notes": [
        "Fees once paid are generally non-transferable.",
        "Promotional offers and discounts may be subject to separate terms.",
        "Prices and fee structures may be revised from time to time without prior notice."
      ]
    },
    {
      "id": "cancellation",
      "num": "05",
      "label": "Cancellation & Refunds",
      "icon": "RotateCcw",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "content": "Registration fees, admission fees, and booking fees are generally non-refundable.\nMissed classes, camps, workshops, or activities are not eligible for refunds, transfers, or compensation.\nAny refund request will be reviewed solely at the discretion of the management."
    },
    {
      "id": "attendance",
      "num": "06",
      "label": "Attendance & Punctuality",
      "icon": "Clock",
      "color": "#FF8A3D",
      "bg": "#FFEADB",
      "content": "Parents and guardians are responsible for ensuring timely arrival and pick-up of children.\nRepeated delays in pick-up may result in administrative action or additional charges where applicable.\nChildren arriving excessively late may not be permitted to participate for safety reasons."
    },
    {
      "id": "health-safety",
      "num": "07",
      "label": "Health & Safety",
      "icon": "HeartPulse",
      "color": "#14B8A6",
      "bg": "#DFF7F1",
      "content": "The safety and well-being of every child is our highest priority.\nParents must disclose medical conditions, allergies, special needs, and dietary restrictions before joining.",
      "bullets": [
        "Medical conditions",
        "Allergies",
        "Special needs",
        "Dietary restrictions",
        "Emergency contact information"
      ]
    },
    {
      "id": "media-consent",
      "num": "08",
      "label": "Photography & Media",
      "icon": "Camera",
      "color": "#F43F5E",
      "bg": "#FFE1E6",
      "content": "Photographs and videos may be taken during classes, camps, events, birthday celebrations, and activities for promotional purposes.",
      "bullets": [
        "Promotional purposes",
        "Social media content",
        "Website galleries",
        "Marketing materials",
        "Event highlights"
      ]
    },
    {
      "id": "conduct",
      "num": "09",
      "label": "Code of Conduct",
      "icon": "Users",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "content": "To ensure a positive environment for all participants, children and parents must maintain respectful communication and behavior.",
      "bullets": [
        "Children must behave respectfully toward instructors and fellow participants.",
        "Parents and guardians must maintain respectful communication with staff and other families.",
        "Any behavior that disrupts activities or compromises safety may result in removal from the program."
      ]
    },
    {
      "id": "ip",
      "num": "10",
      "label": "Intellectual Property",
      "icon": "Copyright",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "content": "All content available through Phulwari (logos, website content, graphics, videos, designs) is the intellectual property of Phulwari.",
      "bullets": [
        "Logos",
        "Website content",
        "Graphics & Illustrations",
        "Photographs & Videos",
        "Designs & Written materials"
      ]
    },
    {
      "id": "liability",
      "num": "11",
      "label": "Limitation of Liability",
      "icon": "Scale",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "content": "While Phulwari takes reasonable precautions to provide a safe environment, participation in physical activities carries inherent risks.",
      "bullets": [
        "Personal injuries",
        "Loss of personal belongings",
        "Property damage",
        "Indirect or consequential losses"
      ]
    },
    {
      "id": "governing-law",
      "num": "12",
      "label": "Governing Law",
      "icon": "Gavel",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "content": "These Terms & Conditions shall be governed and interpreted in accordance with the laws of India.\nAny disputes shall be subject to the exclusive jurisdiction of the courts located in Patna, Bihar."
    },
    {
      "id": "changes",
      "num": "13",
      "label": "Changes to Terms",
      "icon": "RefreshCw",
      "color": "#FF8A3D",
      "bg": "#FFEADB",
      "content": "Phulwari reserves the right to update, revise, or modify these Terms & Conditions at any time without prior notice.\nUpdated versions will be published on our website and will become effective immediately upon publication."
    },
    {
      "id": "contact",
      "num": "14",
      "label": "Contact Us",
      "icon": "Mail",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "content": "If you have any questions regarding these Terms & Conditions, please contact us."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  badge_text = EXCLUDED.badge_text,
  last_updated = EXCLUDED.last_updated,
  title_part1 = EXCLUDED.title_part1,
  title_highlight = EXCLUDED.title_highlight,
  intro_text = EXCLUDED.intro_text,
  sections = EXCLUDED.sections,
  updated_at = NOW();


-- Seed Privacy Policy Data
INSERT INTO public.privacy_page_config (id, badge_text, last_updated, title_part1, title_highlight, title_part2, intro_text, sections)
VALUES (
  1,
  'Privacy Policy',
  'June 2026',
  'Your',
  'Privacy',
  'Matters',
  'At Phulwari – Mother & Child Activity Centre, we value the privacy and trust of every child, parent, guardian, and visitor. This policy explains how we collect, use, and protect your personal information.',
  '[
    {
      "id": "intro",
      "num": "01",
      "label": "Our Commitment",
      "icon": "Shield",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "content": "Phulwari – Mother & Child Activity Centre is committed to protecting the privacy of every child, parent, and guardian who interacts with our services or visits our website.\nBy using our website or enrolling in our programs, you agree to the practices described in this Privacy Policy."
    },
    {
      "id": "collection",
      "num": "02",
      "label": "Information We Collect",
      "icon": "Database",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "content": "We may collect personal information during registration, admissions, inquiries, event bookings, camp registrations, and website interactions.",
      "bullets": [
        "Parent / Guardian: Full Name, Mobile Number, Email Address, Residential Address, Emergency Contact Details",
        "Child: Name, Age & Date of Birth, Medical Info, Allergy Details, Special Needs",
        "Additional: Payment Information, Event Bookings, Photo/Video Consent, Device Info"
      ]
    },
    {
      "id": "usage",
      "num": "03",
      "label": "How We Use It",
      "icon": "FileText",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "content": "The information we collect is used to manage admissions, classes, event registrations, parent communications, and ensure safety.",
      "bullets": [
        "Processing admissions and registrations",
        "Managing classes and attendance",
        "Birthday Party, Summer Camp & Winter Camp bookings",
        "Parent communication and emergency alerts",
        "Customer support and assistance",
        "Ensuring child safety and well-being"
      ]
    },
    {
      "id": "payments",
      "num": "04",
      "label": "Payment Information",
      "icon": "CreditCard",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "content": "Online payments may be processed through secure third-party payment providers.",
      "notes": [
        "Phulwari does not store complete debit card, credit card, UPI, or banking information on its servers.",
        "All payment transactions are handled through secure payment gateways."
      ]
    },
    {
      "id": "sharing",
      "num": "05",
      "label": "Sharing of Information",
      "icon": "Share2",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "content": "We respect your privacy and do not sell, rent, or trade personal information to third parties.",
      "bullets": [
        "Authorized staff members",
        "Payment processing partners",
        "Emergency medical personnel (when necessary)",
        "Law enforcement or government authorities when legally required"
      ]
    },
    {
      "id": "media",
      "num": "06",
      "label": "Photography & Media",
      "icon": "Camera",
      "color": "#FF8A3D",
      "bg": "#FFEADB",
      "content": "Photographs and videos may be captured during Activity Classes, Birthday Celebrations, Summer Camps, Winter Camps, Competitions, and Events for promotional materials and galleries.\nParents may submit a written opt-out request before participation."
    },
    {
      "id": "security",
      "num": "07",
      "label": "Data Security",
      "icon": "Lock",
      "color": "#14B8A6",
      "bg": "#DFF7F1",
      "content": "We implement reasonable administrative, technical, and physical safeguards to protect personal information against unauthorized access, disclosure, or loss."
    },
    {
      "id": "children",
      "num": "08",
      "label": "Children''s Privacy",
      "icon": "Baby",
      "color": "#F43F5E",
      "bg": "#FFE1E6",
      "content": "Protecting children''s privacy is paramount. Information is collected only with the knowledge and consent of parents or legal guardians."
    },
    {
      "id": "cookies",
      "num": "09",
      "label": "Cookies",
      "icon": "Cookie",
      "color": "#3D8BFF",
      "bg": "#E5EFFF",
      "content": "Our website may use cookies to improve user experience, analyse website traffic, and enhance performance.\nUsers can manage or disable cookies through their browser settings."
    },
    {
      "id": "rights",
      "num": "10",
      "label": "Your Rights",
      "icon": "UserCheck",
      "color": "#34B36B",
      "bg": "#E3F7EA",
      "content": "You have the right to request access, correction, or deletion of your personal records at any time."
    },
    {
      "id": "third-party",
      "num": "11",
      "label": "Third-Party Links",
      "icon": "Link",
      "color": "#E8A621",
      "bg": "#FFF3D9",
      "content": "Our website may contain links to external platforms (social media, Google Maps). Users are encouraged to review the privacy policies of those third-party services."
    },
    {
      "id": "changes",
      "num": "12",
      "label": "Changes to Policy",
      "icon": "RefreshCw",
      "color": "#8B5CF6",
      "bg": "#EFE7FE",
      "content": "Phulwari reserves the right to modify or update this Privacy Policy at any time.\nAny updates will be published on this page along with the revised Last Updated date."
    },
    {
      "id": "contact",
      "num": "13",
      "label": "Contact Us",
      "icon": "Mail",
      "color": "#FF4D8D",
      "bg": "#FFE6EF",
      "content": "If you have any questions regarding this Privacy Policy or the handling of your personal information, please contact us."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  badge_text = EXCLUDED.badge_text,
  last_updated = EXCLUDED.last_updated,
  title_part1 = EXCLUDED.title_part1,
  title_highlight = EXCLUDED.title_highlight,
  title_part2 = EXCLUDED.title_part2,
  intro_text = EXCLUDED.intro_text,
  sections = EXCLUDED.sections,
  updated_at = NOW();
