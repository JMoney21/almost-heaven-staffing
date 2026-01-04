import Image from "next/image";

export default function Navbar() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Image src="/logo.png" alt="Logo" width={160} height={60} />

        <nav className="hidden md:flex gap-6 text-sm font-semibold">
          {["Home", "Nurses", "Facilities", "Jobs", "About", "Contact"].map(
            (item) => (
              <a key={item} href="#" className="hover:text-blue-700">
                {item}
              </a>
            )
          )}
        </nav>

        <div className="flex gap-3">
          <button className="rounded-full bg-yellow-400 px-4 py-2 font-semibold">
            Apply Now
          </button>
          <button className="rounded-full border px-4 py-2 font-semibold">
            Request Staff
          </button>
        </div>
      </div>
    </header>
  );
}
