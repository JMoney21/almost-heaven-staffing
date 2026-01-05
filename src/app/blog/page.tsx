import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    slug: "extra-mile-for-travelers",
    title: "We Go the Extra Mile for Healthcare Traveler Care",
    excerpt:
      "How Almost Heaven Staffing supports nurses beyond placement — before, during, and after every assignment.",
    date: "February 3, 2025",
    image: "/blog/blog-1.png",
  },
  {
    slug: "travel-nurse-perks",
    title: "12 Must-Know Perks and Programs for Travel Nurses",
    excerpt:
      "From stipends to scheduling flexibility, here are benefits every travel nurse should understand.",
    date: "June 10, 2024",
    image: "/blog/blog-2.png",
  },
  {
    slug: "supporting-bsn-nurses",
    title: "How Almost Heaven Staffing Supports BSN Nurses",
    excerpt:
      "Why education, preparation, and unit readiness matter when matching nurses to facilities.",
    date: "January 29, 2024",
    image: "/blog/blog-3.png",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#0B2B55]">
            Blog & Resources
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 font-semibold leading-relaxed">
            Insights, tips, and updates for travel nurses and healthcare
            facilities — written by people who understand the work.
          </p>
        </div>

        {/* BLOG GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex h-[230px] flex-col justify-between p-6">
                <div>
                  <div className="text-xs font-extrabold tracking-wide text-[#F6B400]">
                    {post.date}
                  </div>
                  <h2 className="mt-3 text-lg font-black leading-snug text-[#0B2B55]">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    Read article
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6B400] text-[#0B2545] font-black transition group-hover:scale-110"
                  >
                    →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#0B2B55]">
                Ready to take the next step?
              </h3>
              <p className="mt-2 text-slate-600 font-semibold">
                Explore jobs or apply in minutes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
