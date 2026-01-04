export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900">
      {children}
    </div>
  );
}
