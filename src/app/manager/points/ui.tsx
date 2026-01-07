"use client";

import { useMemo, useState } from "react";

type Employee = {
  employee_id: string; // employees.id
  user_id: string; // employees.user_id
  full_name: string | null;
  email: string | null;
  status: string | null;
  disabled: boolean | null;
};

type BalanceRow = {
  employee_id: string;
  total_points: number | null;
};

type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  active: boolean;
  inventory: number | null;
  created_at: string;
};

export default function ManagerPointsClient({
  initialEmployees,
  initialBalances,
  initialRewards,
}: {
  initialEmployees: Employee[];
  initialBalances: BalanceRow[];
  initialRewards: Reward[];
}) {
  const [tab, setTab] = useState<"employees" | "rewards">("employees");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const [employees] = useState<Employee[]>(initialEmployees);
  const [balances, setBalances] = useState<BalanceRow[]>(initialBalances);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);

  const balanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of balances) m.set(b.employee_id, b.total_points ?? 0);
    return m;
  }, [balances]);

  const filteredEmployees = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return employees;
    return employees.filter((e) => {
      const name = (e.full_name ?? "").toLowerCase();
      const email = (e.email ?? "").toLowerCase();
      const status = (e.status ?? "").toLowerCase();
      return (
        name.includes(s) ||
        email.includes(s) ||
        status.includes(s) ||
        e.employee_id.toLowerCase().includes(s)
      );
    });
  }, [employees, q]);

  async function awardPoints(employeeId: string, points: number, reason: string) {
    setBusy(employeeId);
    try {
      const res = await fetch("/api/manager/points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, points, reason }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to apply points");

      setBalances((prev) =>
        prev.some((x) => x.employee_id === employeeId)
          ? prev.map((x) =>
              x.employee_id === employeeId
                ? { ...x, total_points: (x.total_points ?? 0) + points }
                : x
            )
          : [...prev, { employee_id: employeeId, total_points: points }]
      );
    } finally {
      setBusy(null);
    }
  }

  async function refreshRewards() {
    const r2 = await fetch("/api/manager/rewards");
    const j2 = await r2.json().catch(() => ({}));
    setRewards(j2.rewards ?? []);
  }

  async function createReward(payload: {
    title: string;
    description?: string;
    cost: number;
    inventory?: number | null;
  }) {
    setBusy("reward:create");
    try {
      const res = await fetch("/api/manager/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create reward");
      await refreshRewards();
    } finally {
      setBusy(null);
    }
  }

  async function patchReward(id: string, patch: Partial<Reward>) {
    setBusy(`reward:${id}`);
    try {
      const res = await fetch(`/api/manager/rewards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to update reward");
      await refreshRewards();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("employees")}
          className={`rounded-xl px-4 py-2 text-sm font-extrabold ring-1 ring-white/15 ${
            tab === "employees" ? "bg-[#F6B400] text-[#0B2545]" : "bg-white/10 text-white"
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setTab("rewards")}
          className={`rounded-xl px-4 py-2 text-sm font-extrabold ring-1 ring-white/15 ${
            tab === "rewards" ? "bg-[#F6B400] text-[#0B2545]" : "bg-white/10 text-white"
          }`}
        >
          Rewards
        </button>
      </div>

      {tab === "employees" ? (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl border border-white/15 bg-white/10 p-3 text-sm font-semibold text-white placeholder:text-white/50"
            />
            <div className="text-xs font-semibold text-white/70">
              Showing {filteredEmployees.length} of {employees.length}
            </div>
          </div>

          {!employees.length ? (
            <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-white/70 ring-1 ring-white/10">
              No employees found.
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {filteredEmployees.map((e) => {
              const pts = balanceMap.get(e.employee_id) ?? 0;

              return (
                <div key={e.employee_id} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-black text-white">
                        {e.full_name ?? "Employee"}
                      </div>
                      <div className="text-xs font-semibold text-white/70">
                        {e.email ?? "—"} • Status: {e.status ?? "—"} • Points: {pts}
                        {e.disabled ? <span className="ml-2 text-white/60">(disabled)</span> : null}
                      </div>
                    </div>

                    <AwardControls
                      disabled={busy === e.employee_id}
                      onApply={(points, reason) => awardPoints(e.employee_id, points, reason)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <CreateRewardCard busy={busy === "reward:create"} onCreate={createReward} />

          <div className="mt-4 space-y-3">
            {rewards.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-black text-white">
                      {r.title} {!r.active ? <span className="ml-2 text-xs font-extrabold text-white/60">(inactive)</span> : null}
                    </div>
                    <div className="text-xs font-semibold text-white/70">
                      Cost: {r.cost} • Inventory: {r.inventory ?? "∞"}
                    </div>
                    {r.description ? <div className="mt-2 text-sm font-semibold text-white/80">{r.description}</div> : null}
                  </div>

                  <button
                    disabled={busy === `reward:${r.id}`}
                    onClick={() => patchReward(r.id, { active: !r.active })}
                    className="rounded-xl bg-white/10 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/15 hover:bg-white/15 disabled:opacity-60"
                  >
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}

            {!rewards.length ? (
              <div className="rounded-2xl bg-white/10 p-4 text-sm font-semibold text-white/70 ring-1 ring-white/10">
                No rewards yet — add your first reward above.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function AwardControls({
  disabled,
  onApply,
}: {
  disabled: boolean;
  onApply: (points: number, reason: string) => void;
}) {
  const [points, setPoints] = useState<number>(10);
  const [reason, setReason] = useState<string>("Points adjustment");

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(Number(e.target.value))}
        className="w-full rounded-xl border border-white/15 bg-white/10 p-2 text-sm font-semibold text-white sm:w-28"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/10 p-2 text-sm font-semibold text-white sm:w-56"
        placeholder="Reason"
      />
      <button
        disabled={disabled}
        onClick={() => onApply(points, reason)}
        className="rounded-xl bg-[#F6B400] px-4 py-2 text-sm font-black text-[#0B2545] disabled:opacity-60"
      >
        {disabled ? "Saving..." : "Apply"}
      </button>
    </div>
  );
}

function CreateRewardCard({
  busy,
  onCreate,
}: {
  busy: boolean;
  onCreate: (payload: { title: string; description?: string; cost: number; inventory?: number | null }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<number>(50);
  const [inventory, setInventory] = useState<string>("");

  return (
    <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
      <div className="text-sm font-black text-[#0B2B55]">Add reward</div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-sm font-semibold sm:col-span-1"
          placeholder="Title"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-sm font-semibold sm:col-span-2"
          placeholder="Description (optional)"
        />
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white p-2 text-sm font-semibold"
          placeholder="Cost"
        />
        <input
          value={inventory}
          onChange={(e) => setInventory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-sm font-semibold"
          placeholder="Inventory (blank=∞)"
        />
      </div>

      <div className="mt-3">
        <button
          disabled={busy}
          onClick={() => {
            const inv =
              inventory.trim() === "" ? null : Number.isFinite(Number(inventory)) ? Number(inventory) : null;

            onCreate({
              title: title.trim(),
              description: description.trim() ? description.trim() : undefined,
              cost,
              inventory: inv,
            });

            setTitle("");
            setDescription("");
            setCost(50);
            setInventory("");
          }}
          className="rounded-xl bg-[#F6B400] px-4 py-2 text-sm font-black text-[#0B2545] disabled:opacity-60"
        >
          {busy ? "Creating..." : "Create reward"}
        </button>
      </div>
    </div>
  );
}
