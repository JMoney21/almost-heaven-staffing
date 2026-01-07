// src/app/blog/[slug]/page.tsx

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PostSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: {
    intro: string;
    sections: PostSection[];
    closingCta: string;
  };
};

const posts: Post[] = [
  {
    slug: "extra-mile-for-travelers",
    title: "We Go the Extra Mile for Healthcare Traveler Care",
    excerpt:
      "How Almost Heaven Staffing supports nurses beyond placement — before, during, and after every assignment.",
    date: "February 3, 2025",
    image: "/blog/blog-1.png",
    content: {
      intro:
        "Travel nursing can change your life — but it can also feel like a lot: new hospitals, new policies, new cities, and the pressure to hit the ground running. At Almost Heaven Staffing, we believe our job isn’t finished when you sign a contract. We go the extra mile to support you before, during, and after every assignment — because you’re not just a “traveler” to us. You’re a professional, a person, and part of our community.",
      sections: [
        {
          heading: "Before You Accept: We Match More Than a Resume",
          paragraphs: [
            "Anyone can submit you to a facility. What matters is whether the job is a good fit for your skills, goals, and lifestyle. We take time to learn what kind of unit you thrive in, what schedule works for your life, and what “support” looks like for you.",
            "That means you get clear expectations — not surprises. We’ll talk through unit type, patient ratios (when available), shift patterns, floating policies, and anything else you’d want to know before you commit.",
          ],
          bullets: [
            "Honest job details and expectations",
            "Clear pay breakdowns and transparency",
            "Contract review support (so you know what you’re signing)",
            "Fast communication — no ghosting, no guessing",
          ],
        },
        {
          heading: "During the Assignment: You’re Never On Your Own",
          paragraphs: [
            "Some agencies disappear after day one. That’s not how we operate.",
            "If something feels off — schedule issues, onboarding confusion, housing stress, or unit concerns — you shouldn’t have to fight through it alone. We stay involved and reachable because real support means being present when things get real.",
          ],
          bullets: [
            "Check-ins that actually happen",
            "Help navigating facility issues professionally",
            "Quick answers when you need them",
            "A team that treats you like a priority (not a number)",
          ],
        },
        {
          heading: "Pay, Benefits, and Peace of Mind",
          paragraphs: [
            "Travel pay can be confusing — taxable, stipends, reimbursements, and compliance requirements. We keep it simple and transparent so you can focus on nursing, not spreadsheets.",
            "Our goal is for you to understand exactly what you’re earning, what you’re eligible for, and what to do if something doesn’t look right.",
          ],
          bullets: [
            "Clear weekly pay breakdowns",
            "Benefit guidance and enrollment help",
            "Support with compliance/document requirements",
            "Problem-solving if payroll or timekeeping issues come up",
          ],
        },
        {
          heading: "After the Assignment: We Help You Build Momentum",
          paragraphs: [
            "The end of a contract shouldn’t feel like falling off a cliff. We help you plan the next move early — whether that’s extending, switching specialties, changing locations, or taking time off.",
            "We also love hearing what worked and what didn’t — because your feedback helps us find better fits for you going forward.",
          ],
          bullets: [
            "Extension strategy (when it’s worth it)",
            "Next assignment planning before your end date",
            "Career growth support (unit types, specialties, readiness)",
            "A long-term relationship — not a one-time transaction",
          ],
        },
        {
          heading: "What “Extra Mile” Really Means to Us",
          paragraphs: [
            "It’s easy to say you care. It’s different to prove it through consistency — the calls returned, the details handled, the problems solved, and the respect shown.",
            "At Almost Heaven Staffing, we’re building an agency that travelers can trust — because you’re doing hard work in high-stakes environments. You deserve a team that has your back the whole way.",
          ],
        },
      ],
      closingCta:
        "If you’re ready for an agency that stays present, communicates fast, and supports you like family — we’d love to work with you.",
    },
  },

  {
    slug: "travel-nurse-perks",
    title: "12 Must-Know Perks and Programs for Travel Nurses",
    excerpt:
      "From stipends to scheduling flexibility, here are benefits every travel nurse should understand.",
    date: "June 10, 2024",
    image: "/blog/blog-2.png",
    content: {
      intro:
        "Travel nursing isn’t just about seeing new places — it’s about building a career with more flexibility, stronger earning potential, and benefits that can make a real difference. The catch? A lot of perks only help you if you understand how they work. Here are 12 programs and benefits every travel nurse should know about before signing the next contract.",
      sections: [
        {
          heading: "1) Tax-Free Stipends (Housing + Meals & Incidentals)",
          paragraphs: [
            "Many travel contracts include tax-advantaged stipends to help cover housing and day-to-day costs. The key is eligibility: you generally need a qualifying tax home and duplicated expenses while on assignment.",
            "Always ask for a clear pay breakdown so you know what’s taxable vs. stipend.",
          ],
        },
        {
          heading: "2) Travel Reimbursement",
          paragraphs: [
            "Some contracts reimburse mileage, flights, or relocation expenses. Confirm when it’s paid (upfront vs. after start) and whether it’s conditional on completing a certain number of shifts.",
          ],
        },
        {
          heading: "3) Completion Bonuses",
          paragraphs: [
            "Facilities may offer a completion bonus for finishing a contract. Make sure the amount, payout date, and requirements are written into the agreement.",
          ],
        },
        {
          heading: "4) Overtime and Holiday Pay Policies",
          paragraphs: [
            "Overtime rules vary by facility and contract. Ask what counts as OT (weekly hours vs. daily), and how holidays are defined and paid.",
          ],
        },
        {
          heading: "5) Guaranteed Hours",
          paragraphs: [
            "Guaranteed hours can protect your income if the facility cancels shifts. Ask what qualifies as a cancellation and how many can occur before guarantee pay applies.",
          ],
        },
        {
          heading: "6) Contract Extensions",
          paragraphs: [
            "Extensions can reduce onboarding stress and keep your income steady. If you like the unit, ask early about extension options and rate adjustments.",
          ],
        },
        {
          heading: "7) Shift and Schedule Flexibility",
          paragraphs: [
            "One major perk of travel nursing is choosing shifts that fit your life — nights vs. days, block scheduling, weekends, or rotating. Get schedule expectations in writing when possible.",
          ],
        },
        {
          heading: "8) Health Insurance Options",
          paragraphs: [
            "Some agencies offer health coverage starting day one, while others require a waiting period or minimum hours. Ask about start date, dependent coverage, and what happens between assignments.",
          ],
        },
        {
          heading: "9) Retirement Plans (401k / Matching)",
          paragraphs: [
            "If a 401k is offered, find out whether there’s employer matching and how long you must be employed to vest (keep the match).",
          ],
        },
        {
          heading: "10) Licensure Reimbursement",
          paragraphs: [
            "Multi-state work can mean multiple license fees. Many agencies reimburse licenses or certifications—confirm what’s covered and what documentation is needed.",
          ],
        },
        {
          heading: "11) Certifications and Education Support",
          paragraphs: [
            "Some programs help cover BLS/ACLS renewals, specialty certs, or continuing education. Keeping certs current can open higher-paying roles and better units.",
          ],
        },
        {
          heading: "12) Referral Bonuses",
          paragraphs: [
            "If you love your agency, referral bonuses can be a nice extra. Ask how payouts work and whether your referral needs to complete a certain time on contract.",
          ],
        },
        {
          heading: "Quick Checklist Before You Sign",
          bullets: [
            "Ask for a full pay breakdown (taxable vs. stipends)",
            "Confirm guaranteed hours and cancellation rules",
            "Get reimbursements/bonuses in writing",
            "Clarify OT, holiday pay, and floating expectations",
            "Know benefit start dates and requirements",
          ],
        },
      ],
      closingCta:
        "Want help comparing offers or understanding your pay package? Almost Heaven Staffing will break it down clearly and help you choose the best fit for your goals.",
    },
  },

  // ✅ NEW POST: supporting-bsn-nurses
  {
    slug: "supporting-bsn-nurses",
    title: "How Almost Heaven Staffing Supports BSN Nurses",
    excerpt:
      "Why education, preparation, and unit readiness matter when matching nurses to facilities.",
    date: "January 29, 2024",
    image: "/blog/blog-3.png",
    content: {
      intro:
        "A BSN is more than letters after your name — it represents time, discipline, critical thinking, and a deeper foundation in evidence-based practice. At Almost Heaven Staffing, we don’t treat a BSN like a checkbox. We treat it like what it is: preparation that can open doors to higher-acuity units, leadership opportunities, and long-term growth. Here’s how we support BSN nurses before, during, and after each assignment.",
      sections: [
        {
          heading: "We Match Your Education to the Right Opportunity",
          paragraphs: [
            "Not every facility uses BSN training the same way. Some units prioritize BSN nurses for specialty pathways, preceptor roles, quality improvement initiatives, or leadership development. We look for assignments that align with your goals — not just whatever is open that week.",
            "Whether you want ICU exposure, step-down experience, ED pace, or a path toward charge/precepting, we help you target roles that build your résumé in the direction you want to go.",
          ],
          bullets: [
            "Units that value evidence-based practice",
            "Facilities with strong onboarding and support",
            "Assignments that strengthen your specialty track",
          ],
        },
        {
          heading: "We Help You Show Up Ready (Not Just Submitted)",
          paragraphs: [
            "A strong match isn’t only about credentials — it’s about readiness. We help you prepare for onboarding expectations, charting systems, unit flow, and professionalism in communication so you can start confident.",
            "If there’s something you want to sharpen — like telemetry confidence, critical care foundations, or time management — we’ll help you identify it early so you don’t feel behind on day one.",
          ],
          bullets: [
            "Clear expectations before you arrive",
            "Support with compliance and documentation",
            "Upfront conversations about floating, ratios, and unit culture",
          ],
        },
        {
          heading: "We Advocate for Fair Pay and Transparent Packages",
          paragraphs: [
            "Education and preparation matter — and you deserve a clear pay breakdown that makes sense. We explain taxable vs. stipend pay, reimbursements, and any bonuses so you know what you’re actually taking home.",
            "If something looks off, we address it fast. No runaround. No confusion.",
          ],
          bullets: [
            "Pay transparency (no guessing games)",
            "Clear timelines for reimbursements/bonuses",
            "Fast resolution if payroll issues happen",
          ],
        },
        {
          heading: "We Support Growth Between Assignments",
          paragraphs: [
            "A BSN often comes with long-term goals — leadership, advanced practice, educator roles, or specialty mastery. We don’t want you to bounce from contract to contract without momentum.",
            "We help you plan the next step early: extend when it benefits you, pivot when it’s time, and build a path that actually makes sense for your career.",
          ],
          bullets: [
            "Extension strategy and timing",
            "Specialty targeting over “random” placements",
            "Long-term planning with your recruiter",
          ],
        },
        {
          heading: "Bottom Line: You’re Building a Career, Not Just Filling Shifts",
          paragraphs: [
            "You worked hard for your BSN — and your assignments should reflect that. At Almost Heaven Staffing, our goal is to support you like a partner: clear communication, strong matches, and consistent follow-through.",
          ],
        },
      ],
      closingCta:
        "If you’re a BSN nurse looking for assignments that fit your goals (and a team that actually supports you), we’d love to help you build your next move.",
    },
  },
];

function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

// ✅ IMPORTANT FIX: params is treated as a Promise in your Next version
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0B2B55] hover:underline"
        >
          ← Back to Blog
        </Link>

        <header className="mt-6 overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
          <div className="relative h-64 w-full">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-8">
            <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">
              {post.date}
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-black text-[#0B2B55]">
              {post.title}
            </h1>
            <p className="mt-4 text-slate-600 font-semibold leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </header>

        <article className="mt-8 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <p className="text-slate-700 font-semibold leading-relaxed">
            {post.content.intro}
          </p>

          <div className="mt-8 space-y-8">
            {post.content.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="text-xl font-black text-[#0B2B55]">
                  {sec.heading}
                </h2>

                {sec.paragraphs?.map((p, idx) => (
                  <p
                    key={idx}
                    className="mt-3 text-slate-700 font-semibold leading-relaxed"
                  >
                    {p}
                  </p>
                ))}

                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="mt-4 list-disc pl-6 text-slate-700 font-semibold space-y-2">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-[#0B2B55] p-6 text-white">
            <h3 className="text-lg font-black">Ready to get started?</h3>
            <p className="mt-2 text-white/90 font-semibold leading-relaxed">
              {post.content.closingCta}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                View Jobs
              </Link>
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
