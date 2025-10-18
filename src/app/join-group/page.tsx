"use client";
import { useEffect, useMemo, useState } from "react";
import VerifyWithSelf from "../components/VerifyWithSelf";

type Privacy = "public" | "private";

interface GroupRow {
  id: string;
  name: string;
  privacy: Privacy;
  members: number;
  description?: string;
}

const mockGroups: GroupRow[] = [
  { id: "g1", name: "Family Savings Circle", privacy: "public", members: 8, description: "Monthly deposits for family goals." },
  { id: "g2", name: "Friends Travel Fund", privacy: "public", members: 5, description: "Save for our next trip." },
  { id: "g3", name: "Community Support Pool", privacy: "public", members: 23, description: "Emergency support fund." },
  { id: "g4", name: "Investors Guild", privacy: "private", members: 12, description: "Invite-only investing club." },
];

interface StoredGroup {
  id: string;
  name: string;
  description: string;
  privacy: Privacy;
  members: Array<{ id: string; addressOrEmail: string; role: string }>;
  goal: { targetAmount: number; cadence: string; startDate: string; endDate?: string };
  invites: Array<{ code: string; addressOrEmail: string; status: string }>;
  createdAt: string;
  createdBy: string;
}

interface VerificationData {
  isHuman: boolean;
  verifiedAt: string;
  expiresAt: string;
}

const PAGE_SIZE = 3;

const JoinGroupPage = () => {
  const [query, setQuery] = useState("");
  const [privacy, setPrivacy] = useState<"all" | Privacy>("all");
  const [page, setPage] = useState(1);
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [invites, setInvites] = useState<Array<{ code: string; addressOrEmail: string; status: 'sent' | 'accepted' | 'declined' }>>([]);
  const [storedGroups, setStoredGroups] = useState<StoredGroup[]>([]);
  
  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Load invites and groups from localStorage
  useEffect(() => {
    try {
      const rawInvites = localStorage.getItem('tsarosafe_invites');
      if (rawInvites) setInvites(JSON.parse(rawInvites));
      
      const rawGroups = localStorage.getItem('tsarosafe_groups');
      if (rawGroups) setStoredGroups(JSON.parse(rawGroups));
      
      // Load verification data
      const rawVerification = localStorage.getItem('tsarosafe_verification');
      if (rawVerification) {
        const data = JSON.parse(rawVerification);
        setVerificationData(data);
        // Check if verification is still valid (not expired)
        const now = new Date().getTime();
        const expiresAt = new Date(data.expiresAt).getTime();
        setIsVerified(data.isHuman && now < expiresAt);
      }
    } catch {}
  }, []);

  // If invite exists in URL, prefill
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get('invite');
    if (code) setInviteCode(code);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Convert stored groups to GroupRow format
    const storedGroupRows: GroupRow[] = storedGroups.map(g => ({
      id: g.id,
      name: g.name,
      privacy: g.privacy,
      members: g.members.length,
      description: g.description
    }));
    
    // Combine mock groups with stored groups
    const allGroups = [...mockGroups, ...storedGroupRows];
    
    let rows = allGroups.filter(g =>
      g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
    );
    if (privacy !== "all") rows = rows.filter(g => g.privacy === privacy);
    return rows;
  }, [query, privacy, storedGroups]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [query, privacy]);
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleVerificationSuccess = () => {
    // Create verification data with current timestamp and 30-day expiry
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const data: VerificationData = {
      isHuman: true,
      verifiedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    setVerificationData(data);
    setIsVerified(true);
    setShowVerification(false);
    try {
      localStorage.setItem('tsarosafe_verification', JSON.stringify(data));
    } catch {}
    setMessage("Identity verified! You can now join groups.");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleVerificationError = () => {
    setMessage("Verification failed. Please try again.");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
  };

  const handleJoinRequest = (groupId: string) => {
    if (!isVerified) {
      setMessage("Please verify your identity first before joining groups.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setMessage(`Join request sent to group ${groupId}. Awaiting approval.`);
    setTimeout(() => setMessage(null), 2500);
  };

  const handleInviteJoin = () => {
    const code = inviteCode.trim();
    if (!code || code.length < 6) {
      setMessage("Invalid invite code. Please check and try again.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    
    if (!isVerified) {
      setMessage("Please verify your identity first before joining groups.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    // Update local status if we have a matching invite
    setInvites(prev => {
      const updated = prev.map(i => i.code === code ? { ...i, status: 'accepted' as const } : i);
      try { localStorage.setItem('tsarosafe_invites', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setMessage("Invite accepted. You have joined the group.");
    setInviteCode("");
    setTimeout(() => setMessage(null), 2500);
  };

  const handleInviteDecline = () => {
    const code = inviteCode.trim();
    if (!code) return;
    setInvites(prev => {
      const updated = prev.map(i => i.code === code ? { ...i, status: 'declined' as const } : i);
      try { localStorage.setItem('tsarosafe_invites', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setMessage("Invite declined.");
    setInviteCode("");
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Group</h1>
        <p className="text-gray-600 mb-6">Discover public groups or join directly with an invite code.</p>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">{message}</div>
        )}

        {/* Verification Status */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Identity Verification</h2>
              <p className="text-sm text-gray-600">
                {isVerified ? (
                  <span className="text-green-600">✓ Verified Human</span>
                ) : (
                  <span className="text-red-600">✗ Not Verified</span>
                )}
              </p>
              {verificationData && (
                <p className="text-xs text-gray-500 mt-1">
                  Verified: {new Date(verificationData.verifiedAt).toLocaleDateString()}
                  {verificationData.expiresAt && (
                    <span> • Expires: {new Date(verificationData.expiresAt).toLocaleDateString()}</span>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowVerification(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {isVerified ? "Re-verify" : "Verify Identity"}
            </button>
          </div>
        </div>

        {/* Invite code */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Have an invite code?</h2>
          <div className="flex gap-2">
            <input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={handleInviteJoin}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Join
            </button>
            <button
              type="button"
              onClick={handleInviteDecline}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Decline
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search groups by name or description"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={privacy}
            onChange={e => setPrivacy(e.target.value as "all" | Privacy)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          {pageRows.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No groups matched your search.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pageRows.map(g => (
                <li key={g.id} className="p-4 flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{g.description}</p>
                    <div className="mt-2 flex gap-3 text-xs text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">{g.privacy}</span>
                      <span>{g.members} members</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.privacy === "public" ? (
                      <button
                        type="button"
                        onClick={() => handleJoinRequest(g.id)}
                        disabled={!isVerified}
                        className={`px-3 py-2 rounded text-sm ${
                          isVerified 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isVerified ? "Request to Join" : "Verify to Join"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Invite required</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Pagination */}
          <div className="flex items-center justify-between p-3 text-sm text-gray-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Verify Your Identity</h3>
            <p className="text-sm text-gray-600 mb-4">
              You need to verify your identity to join groups. This helps ensure all members are verified humans.
            </p>
            <VerifyWithSelf
              requiredDisclosures={{
                minimumAge: 18,
                nationality: true,
                gender: true,
                excludedCountries: [],
                ofac: false
              }}
              onSuccess={handleVerificationSuccess}
              onError={handleVerificationError}
              onCancel={handleVerificationCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGroupPage;
