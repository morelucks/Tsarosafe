"use client";

import React, { useState, useEffect } from 'react';
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";

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
  const [, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    console.log("Verification successful");
    onSuccess({ verified: true, timestamp: new Date().toISOString() });
  };

  const handleVerificationError = () => {
    console.error("Verification error");
    onError({ error: "Verification failed" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading verification...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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
