// VerifyWithSelf: Self protocol identity verification for group joining
"use client";

import React, { useState, useEffect } from 'react';
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { useMiniPay } from "@/context/MiniPayContext";

interface VerifyWithSelfProps {
  onSuccess: (result: unknown) => void;
  onError: (error: unknown) => void;
  onCancel?: () => void;
  requiredDisclosures?: {
    minimumAge?: number;
    nationality?: boolean;
    gender?: boolean;
    excludedCountries?: never[];
    ofac?: boolean;
  };
  appName?: string;
  scope?: string;
}

const VerifyWithSelf: React.FC<VerifyWithSelfProps> = ({
  onSuccess,
  onError,
  onCancel,
  requiredDisclosures = {
    minimumAge: 18,
    nationality: true,
    gender: false,
    ofac: false,
  },
  appName = "Tsarosafe",
  scope = "tsarosafe-verification"
}) => {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMiniPay } = useMiniPay();

  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: appName,
        scope: scope,
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'https://playground.self.xyz/api/verify'}`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: "Tsarosafe Group Verification",
        disclosures: requiredDisclosures
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize Self app:", err);
      setError("Failed to initialize verification. Please try again.");
      setIsLoading(false);
    }
  }, [userId, appName, scope, requiredDisclosures]);

  const handleSuccessfulVerification = () => {
    onSuccess({ verified: true, timestamp: new Date().toISOString() });
  };

  const handleVerificationError = () => {
    onError({ error: "Verification failed" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500">Loading verification...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm">{error}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs font-bold"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  if (isMiniPay) {
    return (
      <div className="verification-container p-2 flex flex-col items-center text-center">
        <span className="text-3xl mb-2 animate-bounce">🔒</span>
        <h2 className="text-base font-bold text-gray-900 mb-1">Verify Identity</h2>
        <p className="text-xs text-gray-500 mb-4 max-w-xs leading-relaxed">
          To join community savings groups, tap the button below to securely verify your human identity in the Self app.
        </p>

        {selfApp ? (
          <>
            <a
              href={universalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all text-center shadow-[0_4px_15px_rgba(59,130,246,0.2)]"
            >
              Open Self App
            </a>
            
            {/* Run QR code component invisibly for background status polling */}
            <div className="hidden">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={handleVerificationError}
              />
            </div>
          </>
        ) : (
          <div className="text-center p-2">
            <p className="text-xs text-gray-400 animate-pulse">Initializing link...</p>
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="verification-container p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Identity</h2>
      <p className="text-gray-600 mb-4">
        Scan this QR code with the Self app to verify your identity and prove you&apos;re human.
      </p>
      
      {selfApp ? (
        <div className="flex flex-col items-center">
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={handleSuccessfulVerification}
            onError={handleVerificationError}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Don&apos;t have the Self app? Download it from:
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href="https://apps.apple.com/app/self-protocol/id6446204440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                iOS App Store
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="https://play.google.com/store/apps/details?id=xyz.self.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Google Play
              </a>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel Verification
            </button>
          )}
        </div>
      ) : (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading QR Code...</p>
        </div>
      )}
    </div>
  );
};

export default VerifyWithSelf;
