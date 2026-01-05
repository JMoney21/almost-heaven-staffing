export default function RequestStaffPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-black text-[#0B2B55]">Request Staff</h1>
        <p className="mt-3 text-slate-700 font-semibold">
          Tell us what you need — we’ll respond quickly with qualified options.
        </p>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          <form className="grid gap-4 md:grid-cols-2">
            <input className="h-12 rounded-xl border border-slate-200 px-4 font-semibold" placeholder="Facility Name" />
            <input className="h-12 rounded-xl border border-slate-200 px-4 font-semibold" placeholder="Your Name / Title" />
            <input className="h-12 rounded-xl border border-slate-200 px-4 font-semibold" placeholder="Email" />
            <input className="h-12 rounded-xl border border-slate-200 px-4 font-semibold" placeholder="Phone" />

            <input className="h-12 rounded-xl border border-slate-200 px-4 font-semibold md:col-span-2" placeholder="Specialty Needed (ICU, ER, Med-Surg...)" />

            <textarea
              className="min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 font-semibold md:col-span-2"
              placeholder="Details: start date, shift, contract length, headcount, etc."
            />

            <button
              type="button"
              className="h-12 rounded-xl bg-[#0B2B55] font-extrabold text-white shadow hover:brightness-95 md:col-span-2"
            >
              Submit Request →
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
