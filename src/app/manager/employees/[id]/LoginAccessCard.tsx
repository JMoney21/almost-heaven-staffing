"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
  employeeUserId: string | null;
  disabled: boolean;
};

export default function LoginAccessCard({
  employeeId,
  employeeEmail,
  employeeName,
  employeeUserId,
  disabled,
}: Props) {
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // avoid window usage on server render
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const loginUrl = useMemo(() => (origin ? `${origin}/employee/login` : ""), [origin]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setMsg({ type: "ok", text: "Copied ✅" });
  }

  async function post(url: string, payload: any) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as any)?.error || "Request failed");

      setMsg({ type: "ok", text: "Success ✅" });

      // Refresh to re-read server data (user_id / disabled)
      window.location.reload();
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message ?? "Error" });
    } finally {
      setBusy(false);
    }
  }

  async function createLogin() {
    if (!employeeEmail) return setMsg({ type: "err", text: "Employee email is missing." });
    if (!tempPassword || tempPassword.length < 8) {
      return setMsg({ type: "err", text: "Temp password must be 8+ characters." });
    }
    await post(`/api/admin/employees/${employeeId}/create-login`, { tempPassword });
  }

  async function resetPassword() {
    if (!employeeUserId) return setMsg({ type: "err", text: "Employee login not linked yet." });
    if (!newPassword || newPassword.length < 8) {
      return setMsg({ type: "err", text: "New password must be 8+ characters." });
    }
    await post(`/api/admin/employees/${employeeId}/reset-password`, { newPassword });
  }

  async function toggleDisabled() {
    if (!employeeUserId) return setMsg({ type: "err", text: "Employee login not linked yet." });
    await post(`/api/admin/employees/${employeeId}/toggle-disabled`, {});
  }

  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0B2B55]">Login Tools</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Create login, reset password, and disable/enable access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy(employeeEmail)}
            className="rounded-xl border px-4 py-2 text-xs font-black hover:bg-slate-50"
          >
            Copy email
          </button>

          <button
            type="button"
            disabled={!loginUrl}
            onClick={() => copy(loginUrl)}
            className="rounded-xl border px-4 py-2 text-xs font-black hover:bg-slate-50 disabled:opacity-50"
          >
            Copy login URL
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="text-xs font-extrabold text-slate-500">Employee</div>
        <div className="mt-1 text-sm font-black text-slate-900">{employeeName || "—"}</div>
        <div className="mt-1 text-sm font-semibold text-slate-700 break-all">
          {employeeEmail || "—"}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold ring-1 ring-slate-200">
            Login: {employeeUserId ? "Linked ✅" : "Not linked ❌"}
          </span>

          {employeeUserId ? (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                disabled ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {disabled ? "DISABLED" : "ACTIVE"}
            </span>
          ) : null}
        </div>
      </div>

      {msg ? (
        <div
          className={`mt-4 rounded-xl p-3 text-xs font-bold ${
            msg.type === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      {/* If not linked yet: show create login */}
      {!employeeUserId ? (
        <div className="mt-5 rounded-2xl border p-4">
          <div className="text-sm font-black text-[#0B2B55]">Create Login</div>
          <div className="mt-2 text-xs font-semibold text-slate-600">
            Set a temporary password (8+ chars), then send it to the employee.
          </div>

          <input
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="Temp password (8+ characters)"
            className="mt-3 w-full rounded-xl border p-3 text-sm font-semibold"
          />

          <button
            type="button"
            disabled={busy}
            onClick={createLogin}
            className="mt-3 w-full rounded-xl bg-[#F6B400] py-3 text-sm font-black text-[#0B2545] disabled:opacity-60"
          >
            {busy ? "Working..." : "Create Login"}
          </button>
        </div>
      ) : null}

      {/* If linked: show reset + disable */}
      {employeeUserId ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <div className="text-sm font-black text-[#0B2B55]">Reset Password</div>
            <div className="mt-2 text-xs font-semibold text-slate-600">
              Set a new password for this employee.
            </div>

            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (8+ characters)"
              className="mt-3 w-full rounded-xl border p-3 text-sm font-semibold"
            />

            <button
              type="button"
              disabled={busy}
              onClick={resetPassword}
              className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {busy ? "Working..." : "Reset Password"}
            </button>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="text-sm font-black text-[#0B2B55]">Disable / Enable</div>
            <div className="mt-2 text-xs font-semibold text-slate-600">
              Disable prevents employee from logging in.
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={toggleDisabled}
              className={`mt-6 w-full rounded-xl py-3 text-sm font-black disabled:opacity-60 ${
                disabled ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}
            >
              {busy ? "Working..." : disabled ? "Enable Account" : "Disable Account"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
