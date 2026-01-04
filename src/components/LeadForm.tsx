export default function LeadForm() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg grid gap-3 md:grid-cols-4">
      <input className="border p-3 rounded" placeholder="Your Name" />
      <input className="border p-3 rounded" placeholder="Your Email" />
      <input className="border p-3 rounded" placeholder="Phone Number" />
      <button className="rounded bg-yellow-400 font-semibold">
        Get Started →
      </button>
    </div>
  );
}
