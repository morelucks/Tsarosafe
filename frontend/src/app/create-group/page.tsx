"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VerifyWithSelf from "../components/VerifyWithSelf";
import { useCreateGroup } from "@/hooks/useTsaroSafe";

type Privacy = "public" | "private";
type MemberRole = "admin" | "member";
type TokenType = "CELO" | "GSTAR";

interface Member {
  id: string;
  addressOrEmail: string;
  role: MemberRole;
}

interface GroupSettings {
  name: string;
  description: string;
  privacy: Privacy;
  tokenType: TokenType;
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
  tokenType: "CELO",
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
  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

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
    if (!s.tokenType) next.name = "Token type is required.";
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

  const isVerificationFresh = useMemo(() => {
    if (!isVerified) return false;
    if (!expiresAt) return true;
    return new Date(expiresAt) > new Date();
  }, [isVerified, expiresAt]);

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
    setInvites(prev => [next, ...prev]);
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

  const router = useRouter();
  const { createGroup, isLoading: isCreating, isConfirmed, error: createError } = useCreateGroup();

  useEffect(() => {
    if (isConfirmed) {
      setSubmitted(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [isConfirmed, router]);

  const handleSubmit = async () => {
    if (!isVerificationFresh) {
      setShowVerification(true);
      setVerifyError("Verification required before creating the group.");
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert goal dates to Unix timestamps
      const startTimestamp = goal.startDate ? Math.floor(new Date(goal.startDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
      const endTimestamp = goal.endDate 
        ? Math.floor(new Date(goal.endDate).getTime() / 1000)
        : Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000); // Default to 30 days from now

      // Convert target amount to wei (assuming USD, we'll use 18 decimals)
      const targetAmountWei = BigInt(Math.floor(goal.targetAmount * 1e18));

      // Convert token type to enum (0 = CELO, 1 = GSTAR)
      const tokenTypeEnum = settings.tokenType === "CELO" ? 0 : 1;

      // Create group on contract
      await createGroup(
        settings.name,
        settings.description,
        settings.privacy === 'private',
        targetAmountWei,
        members.length + 1, // Include creator
        BigInt(endTimestamp),
        tokenTypeEnum
      );
    } catch (error) {
      console.error('Failed to create group:', error);
      setVerifyError("Failed to create group. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Group</h1>
        <p className="text-gray-600 mb-6">Build your savings group in a few steps.</p>

        {/* Steps */}
        <ol className="flex items-center w-full mb-6 md:mb-8 overflow-x-auto pb-2">
          {steps.map((label, idx) => (
            <li key={label} className="flex-1 min-w-0">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    idx <= activeStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="ml-2 text-xs md:text-sm font-medium text-gray-800 truncate hidden sm:inline">{label}</span>
              </div>
            </li>
          ))}
        </ol>

        {/* Panels */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Contribution Currency</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="tokenType"
                      className="mt-1"
                      checked={settings.tokenType === "CELO"}
                      onChange={() => setSettings({ ...settings, tokenType: "CELO" })}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">CELO</span>
                      <span className="block text-xs text-gray-500">Celo native token for contributions and payouts.</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="tokenType"
                      className="mt-1"
                      checked={settings.tokenType === "GSTAR"}
                      onChange={() => setSettings({ ...settings, tokenType: "GSTAR" })}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">G$ (GoodDollar)</span>
                      <span className="block text-xs text-gray-500">GoodDollar token for inclusive financial access.</span>
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
                <div className="mt-1 flex flex-col md:flex-row gap-2">
                  <input
                    value={pendingMember}
                    onChange={e => setPendingMember(e.target.value)}
                    placeholder="0x... or name@example.com"
                    className="flex-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white placeholder-gray-400"
                  />
                  <select
                    value={pendingRole}
                    onChange={e => setPendingRole(e.target.value as MemberRole)}
                    className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={addMember}
                      className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={generateInviteForPending}
                      className="flex-1 md:flex-none bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap"
                    >
                      Generate Invite
                    </button>
                  </div>
                </div>
                {errors.pendingMember && (
                  <p className="text-xs text-red-600 mt-1">{errors.pendingMember}</p>
                )}
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
                <div className="p-3 rounded border text-gray-900">
                  <p className="font-semibold">Settings</p>
                  <p className="mt-1 text-gray-800">Name: <span className="font-medium">{settings.name}</span></p>
                  <p className="mt-1 text-gray-800">Privacy: <span className="font-medium">{settings.privacy}</span></p>
                  <p className="mt-1 text-gray-800">Currency: <span className="font-medium">{settings.tokenType === "CELO" ? "CELO" : "G$ (GoodDollar)"}</span></p>
                  {settings.description && <p className="mt-1 text-gray-800">Description: <span className="font-medium">{settings.description}</span></p>}
                </div>
                <div className="p-3 rounded border text-gray-900">
                  <p className="font-semibold">Members ({members.length})</p>
                  <ul className="list-disc ml-5 mt-1 text-gray-800">
                    {members.map(m => (
                      <li key={m.id}>{m.addressOrEmail} — {m.role}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded border text-gray-900">
                  <p className="font-semibold">Goal</p>
                  <p className="mt-1 text-gray-800">Target: <span className="font-medium">${goal.targetAmount.toLocaleString()}</span></p>
                  <p className="mt-1 text-gray-800">Cadence: <span className="font-medium">{goal.cadence}</span></p>
                  <p className="mt-1 text-gray-800">Start: <span className="font-medium">{goal.startDate || "-"}</span></p>
                  <p className="mt-1 text-gray-800">End: <span className="font-medium">{goal.endDate || "-"}</span></p>
                </div>
              </div>
              {/* Verification status */}
              <div className="p-4 rounded border flex items-start justify-between">
                <div>
                  <p className="font-medium">Identity Verification</p>
                  <p className={`mt-1 text-sm ${isVerificationFresh ? "text-green-700" : "text-red-700"}`}>
                    {isVerificationFresh ? `Verified${verifiedAt ? ` on ${new Date(verifiedAt).toLocaleString()}` : ""}` : "Not verified or expired"}
                  </p>
                  {verifyError && (
                    <p className="mt-1 text-xs text-red-600">{verifyError}</p>
                  )}
                  {expiresAt && (
                    <p className="mt-1 text-xs text-gray-500">Expires: {new Date(expiresAt).toLocaleString()}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setShowVerification(true); setVerifyError(null); }}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isVerificationFresh ? "Re-verify" : "Verify now"}
                </button>
              </div>

              {showVerification && (
                <div className="border rounded-lg p-4">
                  <VerifyWithSelf
                    onSuccess={() => {
                      setIsVerified(true);
                      const now = new Date();
                      setVerifiedAt(now.toISOString());
                      const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                      setExpiresAt(expiry.toISOString());
                      setVerifyError(null);
                      setShowVerification(false);
                    }}
                    onError={() => {
                      setIsVerified(false);
                      setVerifyError("Verification failed. Please try again.");
                    }}
                    onCancel={() => setShowVerification(false)}
                    requiredDisclosures={{ minimumAge: 18, nationality: true }}
                    appName="Tsarosafe"
                    scope="tsarosafe-verification"
                  />
                </div>
              )}

              {submitted ? (
                <div className="p-4 rounded bg-green-50 text-green-700">
                  Group created successfully! Redirecting to dashboard...
                </div>
              ) : null}
              {createError && (
                <div className="p-4 rounded bg-red-50 text-red-700 mt-2">
                  Error: {createError.message || "Failed to create group"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-2">
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
              disabled={submitting || isCreating || !isVerificationFresh}
              className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
            >
              {submitting || isCreating ? "Creating…" : (isVerificationFresh ? "Create Group" : "Verify to Create")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
