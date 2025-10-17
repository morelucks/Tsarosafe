"use client";
import { useMemo, useState } from "react";

type Privacy = "public" | "private";
type MemberRole = "admin" | "member";

interface Member {
  id: string;
  addressOrEmail: string;
  role: MemberRole;
}

interface GroupSettings {
  name: string;
  description: string;
  privacy: Privacy;
}

interface SavingsGoal {
  targetAmount: number;
  cadence: "daily" | "weekly" | "monthly";
  startDate: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd
}

const initialSettings: GroupSettings = {
  name: "",
  description: "",
  privacy: "private",
};

const initialGoal: SavingsGoal = {
  targetAmount: 0,
  cadence: "monthly",
  startDate: "",
  endDate: "",
};

const steps = ["Settings", "Members", "Goals", "Review"] as const;

const CreateGroupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [settings, setSettings] = useState<GroupSettings>(initialSettings);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMember, setPendingMember] = useState("");
  const [pendingRole, setPendingRole] = useState<MemberRole>("member");
  const [goal, setGoal] = useState<SavingsGoal>(initialGoal);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invites, setInvites] = useState<Array<{ code: string; addressOrEmail: string; status: 'sent' | 'accepted' | 'declined'; }>>([]);

  const [errors, setErrors] = useState<{ 
    name?: string;
    pendingMember?: string;
    targetAmount?: string;
    startDate?: string;
    endDate?: string;
    dateRange?: string;
  }>({});

  const isValidEmail = (value: string): boolean => {
    // Basic RFC-like email pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  };

  const isValidEthAddressFormat = (value: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  };

  const validateSettings = (s: GroupSettings) => {
    const next: typeof errors = {};
    if (s.name.trim().length < 3) next.name = "Name must be at least 3 characters.";
    setErrors(prev => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validatePendingMember = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrors(prev => ({ ...prev, pendingMember: "Enter an email or wallet address." }));
      return false;
    }
    const emailOk = isValidEmail(trimmed);
    const walletOk = isValidEthAddressFormat(trimmed);
    if (!emailOk && !walletOk) {
      setErrors(prev => ({ ...prev, pendingMember: "Invalid email or wallet address (0x + 40 hex)." }));
      return false;
    }
    setErrors(prev => ({ ...prev, pendingMember: undefined }));
    return true;
  };

  const validateGoal = (g: SavingsGoal) => {
    const next: typeof errors = {};
    if (!(g.targetAmount > 0)) next.targetAmount = "Target must be greater than 0.";
    if (!g.startDate) next.startDate = "Start date is required.";
    if (g.endDate && g.startDate) {
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      if (isFinite(start.getTime()) && isFinite(end.getTime())) {
        if (end < start) next.dateRange = "End date must be on or after start date.";
      }
    }
    setErrors(prev => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const canContinue = useMemo(() => {
    if (activeStep === 0) {
      return settings.name.trim().length >= 3;
    }
    if (activeStep === 1) {
      return members.length >= 1; // at least one member besides creator
    }
    if (activeStep === 2) {
      const basic = goal.targetAmount > 0 && !!goal.startDate;
      if (!basic) return false;
      if (goal.endDate && goal.startDate) {
        const start = new Date(goal.startDate);
        const end = new Date(goal.endDate);
        if (isFinite(start.getTime()) && isFinite(end.getTime()) && end < start) return false;
      }
      return true;
    }
    return true;
  }, [activeStep, settings, members, goal]);

  const addMember = () => {
    const value = pendingMember.trim();
    if (!validatePendingMember(value)) return;
    setMembers(prev => [
      ...prev,
      { id: crypto.randomUUID(), addressOrEmail: value, role: pendingRole },
    ]);
    setPendingMember("");
    setPendingRole("member");
  };

  const generateInviteForPending = () => {
    const value = pendingMember.trim();
    if (!validatePendingMember(value)) return;
    const code = crypto.randomUUID();
    const next = { code, addressOrEmail: value, status: 'sent' as const };
    setInvites(prev => {
      const updated = [next, ...prev];
      try {
        localStorage.setItem('tsarosafe_invites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const copyInviteLink = async (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/join-group?invite=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Invite link copied to clipboard');
    } catch {
      alert(link);
    }
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const next = () => {
    if (activeStep === 0) {
      if (!validateSettings(settings)) return;
    }
    if (activeStep === 2) {
      if (!validateGoal(goal)) return;
    }
    setActiveStep(s => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setActiveStep(s => Math.max(s - 1, 0));

  const saveGroupToLocalStorage = () => {
    const groupData = {
      id: crypto.randomUUID(),
      name: settings.name,
      description: settings.description,
      privacy: settings.privacy,
      members: members,
      goal: goal,
      invites: invites,
      createdAt: new Date().toISOString(),
      createdBy: "current-user", // In real app, this would be the actual user ID
    };

    try {
      const existingGroups = JSON.parse(localStorage.getItem('tsarosafe_groups') || '[]');
      const updatedGroups = [...existingGroups, groupData];
      localStorage.setItem('tsarosafe_groups', JSON.stringify(updatedGroups));
      console.log('Group saved to localStorage:', groupData);
    } catch (error) {
      console.error('Failed to save group to localStorage:', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Save to localStorage
    saveGroupToLocalStorage();
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Group</h1>
        <p className="text-gray-600 mb-6">Build your savings group in a few steps.</p>

        {/* Steps */}
        <ol className="flex items-center w-full mb-8">
          {steps.map((label, idx) => (
            <li key={label} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx <= activeStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-800">{label}</span>
              </div>
            </li>
          ))}
        </ol>

        {/* Panels */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  value={settings.name}
                  onChange={e => setSettings({ ...settings, name: e.target.value })}
                  placeholder="e.g., Family Savings Circle"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white placeholder-gray-400"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum 3 characters.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={settings.description}
                  onChange={e => setSettings({ ...settings, description: e.target.value })}
                  placeholder="What is this group for?"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Privacy</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      className="mt-1"
                      checked={settings.privacy === "private"}
                      onChange={() => setSettings({ ...settings, privacy: "private" })}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">Invite-only (Private)</span>
                      <span className="block text-xs text-gray-500">Only invited members can find and join. Group is hidden from search.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      className="mt-1"
                      checked={settings.privacy === "public"}
                      onChange={() => setSettings({ ...settings, privacy: "public" })}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">Discoverable (Public)</span>
                      <span className="block text-xs text-gray-500">Group is visible in search/browse. Admin approval may still be required to join.</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Add Member (email or wallet)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={pendingMember}
                    onChange={e => setPendingMember(e.target.value)}
                    placeholder="0x... or name@example.com"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white placeholder-gray-400"
                  />
                  {errors.pendingMember && (
                    <p className="text-xs text-red-600 mt-1">{errors.pendingMember}</p>
                  )}
                  <select
                    value={pendingRole}
                    onChange={e => setPendingRole(e.target.value as MemberRole)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={addMember}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={generateInviteForPending}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Generate Invite
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Add at least one member.</p>
              </div>

              <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                {members.map(m => (
                  <li key={m.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.addressOrEmail}</p>
                      <p className="text-xs text-gray-500">Role: {m.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {members.length === 0 && (
                  <li className="p-3 text-sm text-gray-500">No members added yet.</li>
                )}
              </ul>

              {/* Invites generated */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mt-4">Invites</h3>
                {invites.length === 0 ? (
                  <p className="text-xs text-gray-500 mt-1">No invites generated yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {invites.map((inv) => (
                      <li key={inv.code} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                        <div className="truncate mr-3">
                          <span className="font-medium">{inv.addressOrEmail}</span>
                          <span className="ml-2 text-gray-600">[{inv.status}]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyInviteLink(inv.code)}
                            className="px-2 py-1 rounded border text-xs"
                          >
                            Copy Link
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Amount (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={goal.targetAmount}
                    onChange={e => setGoal({ ...goal, targetAmount: Number(e.target.value) })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  />
                  {errors.targetAmount && (
                    <p className="text-xs text-red-600 mt-1">{errors.targetAmount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cadence</label>
                  <select
                    value={goal.cadence}
                    onChange={e => setGoal({ ...goal, cadence: e.target.value as SavingsGoal["cadence"] })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={goal.startDate}
                    onChange={e => setGoal({ ...goal, startDate: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>
                  )}
                </div>
    <div>
                  <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
                  <input
                    type="date"
                    value={goal.endDate}
                    onChange={e => setGoal({ ...goal, endDate: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  />
                  {(errors.endDate || errors.dateRange) && (
                    <p className="text-xs text-red-600 mt-1">{errors.endDate || errors.dateRange}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded border">
                  <p className="font-medium">Settings</p>
                  <p>Name: {settings.name}</p>
                  <p>Privacy: {settings.privacy}</p>
                  {settings.description && <p>Description: {settings.description}</p>}
                </div>
                <div className="p-3 rounded border">
                  <p className="font-medium">Members ({members.length})</p>
                  <ul className="list-disc ml-5">
                    {members.map(m => (
                      <li key={m.id}>{m.addressOrEmail} — {m.role}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded border">
                  <p className="font-medium">Goal</p>
                  <p>Target: ${goal.targetAmount.toLocaleString()}</p>
                  <p>Cadence: {goal.cadence}</p>
                  <p>Start: {goal.startDate || "-"}</p>
                  <p>End: {goal.endDate || "-"}</p>
                </div>
              </div>
              {submitted ? (
                <div className="p-4 rounded bg-green-50 text-green-700">
                  Group created successfully (mock). You can now proceed to manage it.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 disabled:opacity-50"
          >
            Back
          </button>
          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
