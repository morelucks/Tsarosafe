"use client";
import { useEffect, useMemo, useState } from "react";
import VerifyWithSelf from "@/app/components/VerifyWithSelf";
import { usePublicGroups, usePublicGroupsByTokenType, useJoinGroup } from "@/hooks/useTsaroSafe";
import { Group } from "@/types/group";

type Privacy = "public" | "private";
type TokenType = "CELO" | "GSTAR";

interface GroupRow {
  id: string;
  name: string;
  privacy: Privacy;
  members: number;
  description?: string;
  tokenType?: TokenType;
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
  const [tokenType, setTokenType] = useState<"all" | TokenType>("all");
  const [page, setPage] = useState(1);
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [invites, setInvites] = useState<Array<{ code: string; addressOrEmail: string; status: 'sent' | 'accepted' | 'declined' }>>([]);
  
  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  // Load public groups from contract based on token filter
  const { groups: allPublicGroupsData, isLoading: isLoadingAllGroups } = usePublicGroups(0n, 50);
  const { groups: celoGroupsData, isLoading: isLoadingCeloGroups } = usePublicGroupsByTokenType(0, 0n, 50);
  const { groups: gstarGroupsData, isLoading: isLoadingGstarGroups } = usePublicGroupsByTokenType(1, 0n, 50);
  const { joinGroup, isLoading: isJoining, isConfirmed: isJoined } = useJoinGroup();

  // Type assertions for proper TypeScript support
  const allPublicGroups = allPublicGroupsData as Group[] | undefined;
  const celoGroups = celoGroupsData as Group[] | undefined;
  const gstarGroups = gstarGroupsData as Group[] | undefined;

  // Determine which groups to use based on token filter
  const publicGroups = useMemo(() => {
    if (tokenType === "CELO") return celoGroups;
    if (tokenType === "GSTAR") return gstarGroups;
    return allPublicGroups;
  }, [tokenType, celoGroups, gstarGroups, allPublicGroups]);

  const isLoadingGroups = tokenType === "CELO" ? isLoadingCeloGroups : 
                         tokenType === "GSTAR" ? isLoadingGstarGroups : 
                         isLoadingAllGroups;

  // Load invites and verification from localStorage (these are UI-only, not contract data)
  useEffect(() => {
    try {
      const rawInvites = localStorage.getItem('tsarosafe_invites');
      if (rawInvites) setInvites(JSON.parse(rawInvites));
      
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
    
    // Convert contract groups to GroupRow format
    const contractGroupRows: GroupRow[] = (publicGroups || []).map((g: Group) => ({
      id: g.id.toString(),
      name: g.name,
      privacy: g.isPrivate ? 'private' : 'public',
      members: 0, // Will be fetched separately if needed
      description: g.description,
      tokenType: (g.tokenType ?? 0) === 0 ? 'CELO' : 'GSTAR'
    }));
    
    // Filter by search query and privacy
    let rows = contractGroupRows.filter(g =>
      g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
    );
    if (privacy !== "all") rows = rows.filter(g => g.privacy === privacy);
    
    return rows;
  }, [query, privacy, publicGroups]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [query, privacy, tokenType]);
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

  const handleJoinRequest = async (groupId: string) => {
    if (!isVerified) {
      setMessage("Please verify your identity first before joining groups.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    try {
      await joinGroup(BigInt(groupId));
      setMessage(`Successfully joined group ${groupId}!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to join group:', error);
      setMessage(`Failed to join group. Please try again.`);
      setTimeout(() => setMessage(null), 3000);
    }
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
      return prev.map(i => i.code === code ? { ...i, status: 'accepted' as const } : i);
    });
    setMessage("Invite accepted. You have joined the group.");
    setInviteCode("");
    setTimeout(() => setMessage(null), 2500);
  };

  const handleInviteDecline = () => {
    const code = inviteCode.trim();
    if (!code) return;
    setInvites(prev => {
      return prev.map(i => i.code === code ? { ...i, status: 'declined' as const } : i);
    });
    setMessage("Invite declined.");
    setInviteCode("");
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Group</h1>
        <p className="text-gray-600 mb-6">
          Discover public groups or join directly with an invite code.
          {tokenType !== "all" && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Filtering by {tokenType === "CELO" ? "CELO" : "G$ (GoodDollar)"}
            </span>
          )}
        </p>

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
                  <span className="text-green-600">✓ Verified Human - You can join groups</span>
                ) : (
                  <span className="text-red-600">✗ Not Verified - Verification required to join groups</span>
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
            <option value="all">All Privacy</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select
            value={tokenType}
            onChange={e => setTokenType(e.target.value as "all" | TokenType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="all">All Tokens</option>
            <option value="CELO">CELO</option>
            <option value="GSTAR">G$ (GoodDollar)</option>
          </select>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          {isLoadingGroups ? (
            <div className="p-6 text-sm text-gray-600">Loading groups...</div>
          ) : pageRows.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No groups matched your search.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pageRows.map(g => (
                <li key={g.id} className="p-4 flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{g.description}</p>
                    <div className="mt-2 flex gap-3 text-xs text-gray-600 flex-wrap">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">{g.privacy}</span>
                      {g.tokenType && (
                        <span className={`inline-flex items-center px-2 py-1 rounded ${
                          g.tokenType === 'CELO' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {g.tokenType === 'CELO' ? 'CELO' : 'G$'}
                        </span>
                      )}
                      <span>{g.members} members</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.privacy === "public" ? (
                      <button
                        type="button"
                        onClick={() => handleJoinRequest(g.id)}
                        disabled={!isVerified || isJoining}
                        className={`px-3 py-2 rounded text-sm ${
                          isVerified && !isJoining
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isJoining ? "Joining..." : (isVerified ? "Join Group" : "Verify to Join")}
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
              <strong>Verification is required to join groups.</strong> This helps ensure all members are verified humans and maintains the security of our savings groups.
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
