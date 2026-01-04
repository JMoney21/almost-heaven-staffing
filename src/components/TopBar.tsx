export default function TopBar() {
  return (
    <div className="bg-[#0b2a4a] text-white text-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <div className="flex gap-4">
          <span>📞 (555) 555-5555</span>
          <span>✉️ info@almostheavenstaffing.com</span>
        </div>

        <div className="flex gap-3 opacity-80">
          <span>Compliance Verified</span>
          <span>f</span>
          <span>ig</span>
          <span>in</span>
        </div>
      </div>
    </div>
  );
}
