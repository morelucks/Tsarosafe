// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./TsaroSafe.sol";
import "../interfaces/IEngagementRewards.sol";

/**
 * @title TsaroSafeRewardsAdapter
 * @notice Thin adapter that connects TsaroSafe activity to GoodDollar EngagementRewards
 * @dev The goal is to maximize reward capture for your app while keeping logic simple and safe.
 *      - Frontend is responsible for only calling this after a valid TsaroSafe action
 *      - EngagementRewards enforces global cooldowns and per-app limits
 */
contract TsaroSafeRewardsAdapter {
    /// @notice Core TsaroSafe contract whose users will earn rewards
    TsaroSafe public immutable tsaroSafe;

    /// @notice GoodDollar EngagementRewards contract
    IEngagementRewards public immutable engagementRewards;

    /// @notice Optional simple throttle so a user cannot spam claims via this adapter
    mapping(address => uint256) public lastClaimBlock;

    /// @notice Minimum blocks between adapter claims per user (can be tuned; here ~5 min on Celo)
    uint256 public constant MIN_BLOCKS_BETWEEN_CLAIMS = 25;

    event RewardClaimFailed(address indexed user, string reason);
    event RewardClaimAttempt(
        address indexed user,
        address indexed inviter,
        uint256 validUntilBlock,
        bool usedSignature
    );

    constructor(address tsaroSafe_, address engagementRewards_) {
        require(tsaroSafe_ != address(0), "TsaroSafe address zero");
        require(engagementRewards_ != address(0), "Rewards address zero");
        tsaroSafe = TsaroSafe(tsaroSafe_);
        engagementRewards = IEngagementRewards(engagementRewards_);
    }

    /**
     * @notice Claim rewards for a user after they perform a TsaroSafe action
     * @dev This uses the default EngagementRewards percentages (simpler & safer).
     *      You earn as the app whenever:
     *        - Your app is registered + approved on EngagementRewards
     *        - User is whitelisted in GoodDollar Identity
     *      Frontend should:
     *        - Get validUntilBlock from the engagement SDK
     *        - Pass signature for first-time registration, else 0x
     * @param inviter Address that referred the user (0x0 if none)
     * @param validUntilBlock Block number until which the signature is valid
     * @param signature User signature from GoodDollar SDK (0x for subsequent claims)
     */
    function claimAfterAction(
        address inviter,
        uint256 validUntilBlock,
        bytes calldata signature
    ) external {
        // Simple per-user throttle (your economic safety net, EngagementRewards
        // still enforces its own 180-day cooldown and app limits)
        uint256 lastBlock = lastClaimBlock[msg.sender];
        if (lastBlock != 0 && block.number < lastBlock + MIN_BLOCKS_BETWEEN_CLAIMS) {
            revert("TsaroSafe: claim too frequent");
        }
        lastClaimBlock[msg.sender] = block.number;

        // NOTE: We deliberately keep on-chain validation minimal to avoid
        //       expensive reads over groupContributions. Your frontend and
        //       business rules should only call this when the user has
        //       successfully created a group / contributed / completed a goal.

        emit RewardClaimAttempt(msg.sender, inviter, validUntilBlock, signature.length > 0);

        // Try to claim, but NEVER block TsaroSafe UX if this fails
        try engagementRewards.appClaim(
            msg.sender,
            inviter,
            validUntilBlock,
            signature
        ) returns (bool success) {
            if (!success) {
                emit RewardClaimFailed(msg.sender, "claim returned false");
            }
        } catch Error(string memory reason) {
            emit RewardClaimFailed(msg.sender, reason);
        } catch {
            emit RewardClaimFailed(msg.sender, "unknown error");
        }
    }
}


