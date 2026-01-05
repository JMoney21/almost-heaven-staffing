import Header from "@/components/Header";

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-[#F4F6FA] text-slate-900">
      <Header />

      <section className="mx-auto max-w-5xl px-6 py-14">
        {/* PAGE TITLE */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#0B2B55]">
            Nurse Application
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 font-semibold">
            Complete the application below. A recruiter will contact you
            within 24 hours.
          </p>
        </div>

        {/* APPLICATION FORM */}
        <form className="space-y-10 rounded-3xl bg-white p-8 shadow-md ring-1 ring-slate-200">
          
          {/* PERSONAL INFO */}
          <div>
            <h2 className="mb-4 text-xl font-black text-[#0B2B55]">
              Personal Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="First Name" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Last Name" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Email" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Phone Number" />
              <input className="h-12 rounded-xl border px-4 font-semibold md:col-span-2" placeholder="City, State" />
            </div>
          </div>

          {/* LICENSE INFO */}
          <div>
            <h2 className="mb-4 text-xl font-black text-[#0B2B55]">
              License & Credentials
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="License Type (RN / LPN)" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Primary License State" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Years of Experience" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Specialty (ICU, ER, Med-Surg)" />
            </div>
          </div>

          {/* WORK PREFERENCES */}
          <div>
            <h2 className="mb-4 text-xl font-black text-[#0B2B55]">
              Work Preferences
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Preferred Location(s)" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Preferred Shift (Days/Nights)" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Availability Start Date" />
              <input className="h-12 rounded-xl border px-4 font-semibold" placeholder="Contract Type (Travel / Local)" />
            </div>
          </div>

          {/* ADDITIONAL INFO */}
          <div>
            <h2 className="mb-4 text-xl font-black text-[#0B2B55]">
              Additional Information
            </h2>

            <textarea
              className="min-h-[140px] w-full rounded-xl border px-4 py-3 font-semibold"
              placeholder="Tell us anything else we should know (certifications, unit preferences, scheduling needs, etc.)"
            />
          </div>

          {/* CONSENT */}
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4" />
            <p className="text-sm font-semibold text-slate-600">
              I consent to being contacted by Almost Heaven Staffing regarding
              employment opportunities.
            </p>
          </div>

          {/* SUBMIT */}
          <div className="pt-4">
            <button
              type="button"
              className="h-12 w-full rounded-xl bg-[#F6B400] font-extrabold text-[#0B2545] hover:brightness-95"
            >
              Submit Application
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              This form is secure and confidential.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
