import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const earnWays = [
  {
    title: "Complete Assignments",
    points: "1,000 points",
    detail: "Earn for every 4 weeks completed on contract (prorated weekly).",
    badge: "Trail Miles",
  },
  {
    title: "Extension Bonus",
    points: "2,500 points",
    detail: "Earn when you extend a contract (per extension).",
    badge: "Summit Bonus",
  },
  {
    title: "Referral: Nurse",
    points: "10,000 points",
    detail: "Earn when your referred nurse completes their first 30 days on assignment.",
    badge: "Camp Buddy",
  },
  {
    title: "Referral: Facility Lead",
    points: "15,000 points",
    detail: "Earn when a facility lead you refer becomes a staffing client (first filled contract).",
    badge: "Trail Guide",
  },
  {
    title: "Fast Start Bonus",
    points: "1,500 points",
    detail: "Earn when you submit required onboarding items within 72 hours.",
    badge: "Quick Pack",
  },
  {
    title: "Hard-to-Fill Bonus",
    points: "Up to 5,000 points",
    detail: "Earn for select urgent roles and locations (posted per job).",
    badge: "Blaze Route",
  },
];

const redeemOptions = [
  { title: "Cash Payout", desc: "Redeem points for cash (direct deposit payout).", examples: "$50, $100, $250, $500+" , icon:"💵"},
  { title: "Gift Cards", desc: "Amazon, Visa, Target, Starbucks, and more.", examples: "$25, $50, $100+" , icon:"🎁"},
  { title: "Travel & Vacations", desc: "Use points toward flights, hotels, cruises, and getaways.", examples: "Weekend trips → full vacations" , icon:"✈️"},
  { title: "Gear & Essentials", desc: "Scrubs, shoes, luggage, tech, and travel gear.", examples: "Shoes • luggage • tech" , icon:"🧳"},
];

export default function BaseCampRewardsPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* CAMP HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B2B55] p-10 text-white shadow-lg ring-1 ring-white/10">
          {/* “Night sky” twinkles */}
          <div className="pointer-events-none absolute inset-0 opacity-35">
            <div className="absolute left-6 top-8 h-1 w-1 rounded-full bg-white/70 animate-pulse" />
            <div className="absolute left-24 top-16 h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
            <div className="absolute right-20 top-10 h-1 w-1 rounded-full bg-white/70 animate-pulse" />
            <div className="absolute right-10 top-24 h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
            <div className="absolute left-1/2 top-6 h-1 w-1 rounded-full bg-white/70 animate-pulse" />
          </div>

          {/* Mountain gradient overlay */}
          <div className="pointer-events-none absolute -bottom-24 left-0 right-0 h-64 bg-gradient-to-t from-black/25 via-white/5 to-transparent" />

          <div className="relative">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold ring-1 ring-white/15">
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[#0B2545]">⛺ Base Camp</span>
              <span className="text-white/85">Rewards Program</span>
              <span className="text-white/60">•</span>
              <span className="text-white/85">Earn points on every assignment</span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Base Camp Rewards
              <span className="block text-amber-300">Earn. Redeem. Adventure.</span>
            </h1>

            <p className="mt-4 max-w-3xl text-white/85 font-semibold leading-relaxed">
              Points for completing assignments, extending contracts, and referring nurses —
              then cash out for <span className="text-white font-extrabold">cash</span>,{" "}
              <span className="text-white font-extrabold">gift cards</span>, and{" "}
              <span className="text-white font-extrabold">vacations</span>.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:bg-amber-300"
              >
                Start Earning →
              </Link>
              <Link
                href="/jobs"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                Explore Jobs
              </Link>
            </div>

            {/* mini “camp chips” */}
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-extrabold">
              {["🏔️ Trail Miles", "🔥 Campfire Bonuses", "🧭 Simple Redemption", "💰 Real Rewards"].map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-2 ring-1 ring-white/15">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* TRAIL MAP: HOW IT WORKS */}
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#0B2B55]">Trail Map</h2>
              <p className="mt-2 text-slate-600 font-semibold">
                Three simple steps from work → points → rewards.
              </p>
            </div>
            <div className="text-xs font-extrabold text-slate-500">
              Conversion: <span className="text-slate-800">100 points = $1</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { n: "1", t: "Earn points", d: "Assignments, extensions, and referrals earn points automatically." },
              { n: "2", t: "Build your balance", d: "Points stack as you work. Bonuses drop on milestones." },
              { n: "3", t: "Cash out", d: "Redeem for cash, gift cards, travel, and more." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative overflow-hidden rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-200/60 blur-2xl" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-[#0B2B55] ring-1 ring-slate-200">
                    {s.n}
                  </div>
                  <div>
                    <div className="text-lg font-black text-[#0B2B55]">{s.t}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-600">{s.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-amber-200 text-xl">
                🔥
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0B2B55]">Campfire Example</div>
                <p className="mt-2 text-sm font-semibold text-slate-700 leading-relaxed">
                  Two 13-week assignments + one extension + one nurse referral:
                  <span className="block mt-2 font-extrabold text-slate-900">
                    ~6,000 points (assignments) + 2,500 (extension) + 10,000 (referral)
                    = 18,500 points (~$185 value)
                  </span>
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  *Examples are illustrative. Final point values can vary by promotions and contract types.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EARN SECTION */}
        <div className="mt-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#0B2B55]">How nurses earn points</h2>
              <p className="mt-2 text-slate-600 font-semibold">
                Rack up points like trail miles — the more you move, the more you earn.
              </p>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
            >
              Apply & Start Earning →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {earnWays.map((w) => (
              <div
                key={w.title}
                className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                {/* subtle “woodgrain” gradient */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#F6B400,transparent_55%),radial-gradient(circle_at_80%_0%,#0B2B55,transparent_55%),linear-gradient(90deg,transparent,rgba(0,0,0,0.2),transparent)]" />
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-black text-[#0B2B55]">{w.title}</div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
                        {w.badge}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-600">{w.detail}</div>
                  </div>

                  <div className="shrink-0 rounded-xl bg-amber-100 px-3 py-2 text-sm font-extrabold text-[#0B2545] ring-1 ring-amber-200">
                    {w.points}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs font-semibold text-slate-500">
            Referral points are awarded after eligibility is met (example: start + required milestone completed).
          </div>
        </div>

        {/* REDEEM SECTION */}
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <h2 className="text-2xl font-black text-[#0B2B55]">Cash out at the Outfitter</h2>
          <p className="mt-2 max-w-3xl text-slate-600 font-semibold">
            Redeem your points for rewards that feel worth it — cash, gift cards, gear, or vacations.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {redeemOptions.map((r) => (
              <div
                key={r.title}
                className="relative overflow-hidden rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200"
              >
                <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-amber-200/50 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 text-xl">
                      {r.icon}
                    </div>
                    <div className="text-lg font-black text-[#0B2B55]">{r.title}</div>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-600">{r.desc}</div>
                  <div className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
                    Examples: {r.examples}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-extrabold text-[#0B2B55]">Redemption basics</div>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
              {[
                "Minimum redemption: 5,000 points ($50 value).",
                "Cash redemptions paid on a scheduled cycle (weekly or bi-weekly).",
                "Gift cards delivered digitally.",
                "Travel rewards can be redeemed toward eligible travel purchases.",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black">
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              *Adjust thresholds and payout cycles to match your internal process.
            </p>
          </div>
        </div>

        {/* CAMP FAQ / CTA */}
        <div className="mt-10 rounded-3xl bg-[#0B2B55] p-8 text-white shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black">Base Camp FAQ</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="font-extrabold">Do points expire?</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    You can set this policy. Many programs use “no expiration” or “expire after 12 months of inactivity.”
                  </div>
                </div>

                <div>
                  <div className="font-extrabold">When do I receive referral points?</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    After the referred nurse starts and completes the eligibility milestone (example: 30 days worked).
                  </div>
                </div>

                <div>
                  <div className="font-extrabold">How do I redeem?</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    Redeem through your recruiter (or a simple redemption form / portal when available).
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="rounded-full bg-[#F6B400] px-6 py-3 text-sm font-extrabold text-[#0B2545] hover:brightness-95"
              >
                Apply & Start Earning
              </Link>
              <Link
                href="/jobs"
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                Explore Jobs
              </Link>
            </div>
          </div>

          <div className="mt-6 text-xs font-semibold text-white/70">
            Disclaimer: Terms, point amounts, eligibility, and reward availability may be updated at any time.
            No points are earned for cancelled assignments or ineligible referrals.
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
