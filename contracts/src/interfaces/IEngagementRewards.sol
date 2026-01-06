// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IEngagementRewards
 * @notice Minimal interface for the GoodDollar EngagementRewards contract
 * @dev See official docs for full details:
 *      https://docs.gooddollar.org/for-developers/apis-and-sdks/engagement-rewards
 */
interface IEngagementRewards {
    /**
     * @notice Claim rewards using the default distribution percentages
     * @param user The user who performed the action
     * @param inviter Optional inviter address (can be zero)
     * @param validUntilBlock Block number until which the signature is valid
     * @param signature User signature (0x for subsequent claims after registration)
     */
    function appClaim(
        address user,
        address inviter,
        uint256 validUntilBlock,
        bytes calldata signature
    ) external returns (bool);

    /**
     * @notice Claim rewards with custom distribution percentages
     * @param user The user who performed the action
     * @param inviter Optional inviter address (can be zero)
     * @param validUntilBlock Block number until which the signature is valid
     * @param signature User signature (0x for subsequent claims after registration)
     * @param userAndInviterPercentage Combined percentage for user + inviter
     * @param userPercentage Percentage for user out of the combined share
     */
    function appClaim(
        address user,
        address inviter,
        uint256 validUntilBlock,
        bytes calldata signature,
        uint8 userAndInviterPercentage,
        uint8 userPercentage
    ) external returns (bool);
}


