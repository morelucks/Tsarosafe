// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/ITsaroSafeData.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title TsaroSafe
 * @notice Main TsaroSafe contract for decentralized savings groups
 * @dev Implements Create Groups and Join/Leave Groups milestones
 */
contract TsaroSafe is ITsaroSafeData {
    // ============ Custom Errors ============
    
    // Group validation errors
    error EmptyName();
    error NameTooLong();
    error DescriptionTooLong();
    error InvalidTarget();
    error InvalidMemberLimit();
    error MemberLimitExceeded();
    error InvalidEndDate();
    error EndDateTooFar();
    
    // Access control errors
    error NotCreator();
    error NotMember();
    error CannotRemoveSelf();
    
    // Group state errors
    error GroupNotExists();
    error GroupNotActive();
    error AlreadyMember();
    error GroupAtCapacity();
    error GroupEnded();
    error GroupCompleted();
    error CreatorCannotLeave();
    
    // Contribution errors
    error InvalidAmount();
    error ContributionNotFound();
    error ContributionAlreadyWithdrawn();
    
    // Goal and milestone errors
    error InvalidLimit();
    error InvalidDeadline();
    error InvalidMilestone();
    error MilestoneNotFound();
    
    // Token errors
    error InvalidTokenAddress();
    error TokenTransferFailed();
    error TokenTypeMismatch();
    error InsufficientAllowance();
    
    // Withdrawal errors
    error WithdrawalNotAllowed();
    error InsufficientContractBalance();
    error WithdrawalFailed();

    // ============ Enums ============
    
    enum GroupType {
        ProjectPool,
        CircleSavings
    }

    // ============ State Variables ============
    
    // Token addresses for ERC20 support
    address public goodDollarAddress;
    address public celoAddress;

    // ID counters
    uint256 public nextGroupId = 1;
    uint256 public nextContributionId = 1;
    uint256 public nextMilestoneId = 1;

    // ============ Mappings ============
    
    // Group management
    mapping(uint256 => Group) public groups;
    mapping(uint256 => GroupType) public groupTypes;
    mapping(uint256 => ITsaroSafeData.TokenType) public groupTokenTypes;
    mapping(uint256 => mapping(address => Member)) public groupMembers;
    mapping(uint256 => address[]) public groupMemberList;
    mapping(address => uint256[]) public userGroups;

    // Contribution tracking
    mapping(uint256 => ContributionHistory[]) public groupContributions;
    mapping(uint256 => uint256) public groupTotalContributions;
    mapping(uint256 => uint256) public groupTotalAmount;
    mapping(address => mapping(uint256 => uint256)) public memberTotalContributions;
    mapping(address => mapping(uint256 => uint256)) public memberTotalAmount;

    // Round payment tracking
    mapping(uint256 => uint256) public groupActiveRound; // groupId => active round id
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private roundPayments; // groupId => roundId => member => paid

    // Goal setting
    mapping(uint256 => GroupGoal) public groupGoals;
    mapping(uint256 => GoalMilestone[]) public groupMilestones;
    mapping(uint256 => uint256) public groupGoalDeadlines;

    // Withdrawal tracking
    mapping(uint256 => mapping(uint256 => bool)) public withdrawnContributions; // groupId => contributionId => withdrawn
    mapping(uint256 => mapping(address => uint256)) public memberWithdrawnAmount; // groupId => member => total withdrawn

    // ============ Events ============
    
    // Group management events
    event GroupCreated(
        uint256 indexed groupId,
        address indexed creator,
        string name,
        bool isPrivate,
        uint256 targetAmount,
        uint256 memberLimit,
        uint256 endDate
    );
    event MemberJoined(uint256 indexed groupId, address indexed member);
    event MemberLeft(uint256 indexed groupId, address indexed member);
    event GroupUpdated(uint256 indexed groupId, string field, string value);

    // Contribution events
    event ContributionMade(
        uint256 indexed contributionId,
        uint256 indexed groupId,
        address indexed member,
        uint256 amount,
        string description,
        uint256 timestamp
    );
    event ContributionMadeWithToken(
        uint256 indexed contributionId,
        uint256 indexed groupId,
        address indexed member,
        uint256 amount,
        uint8 tokenType,
        string description,
        uint256 timestamp
    );
    event ContributionVerified(
        uint256 indexed contributionId,
        uint256 indexed groupId,
        address indexed member,
        bool verified
    );

    // Goal setting events
    event GoalSet(uint256 indexed groupId, uint256 targetAmount, uint256 deadline, uint256 createdAt);
    event GoalUpdated(uint256 indexed groupId, uint256 oldTarget, uint256 newTarget, address indexed updater);
    event GoalCompleted(uint256 indexed groupId, uint256 targetAmount, uint256 actualAmount, uint256 completedAt);
    event MilestoneReached(
        uint256 indexed milestoneId,
        uint256 indexed groupId,
        uint256 targetAmount,
        uint256 reachedAt
    );
    event ProgressUpdated(
        uint256 indexed groupId,
        uint256 currentAmount,
        uint256 targetAmount,
        uint256 progressPercentage
    );

    // Withdrawal events
    event WithdrawalInitiated(
        uint256 indexed groupId,
        uint256 indexed contributionId,
        address indexed member,
        uint256 amount,
        uint8 tokenType,
        uint256 timestamp
    );
    event WithdrawalCompleted(
        uint256 indexed groupId,
        uint256 indexed contributionId,
        address indexed member,
        uint256 amount,
        uint8 tokenType,
        uint256 timestamp
    );

    // ============ Modifiers ============
    modifier onlyGroupCreator(uint256 groupId) {
        if (groups[groupId].creator != msg.sender) revert NotCreator();
        _;
    }

    modifier onlyGroupMember(uint256 groupId) {
        if (!groupMembers[groupId][msg.sender].isActive) revert NotMember();
        _;
    }

    modifier groupExists(uint256 groupId) {
        if (groups[groupId].id == 0) revert GroupNotExists();
        _;
    }

    modifier groupActive(uint256 groupId) {
        if (!groups[groupId].isActive) revert GroupNotActive();
        _;
    }

    /**
     * @notice Constructor to initialize token addresses
     * @param goodDollarAddress_ Address of GoodDollar token
     * @param celoAddress_ Address of CELO token (can be zero address for native CELO)
     */
    constructor(address goodDollarAddress_, address celoAddress_) {
        if (goodDollarAddress_ == address(0)) revert InvalidTokenAddress();
        goodDollarAddress = goodDollarAddress_;
        celoAddress = celoAddress_;
    }

    /**
     * @notice Update GoodDollar token address
     * @param newAddress New GoodDollar token address
     */
    function setGoodDollarAddress(address newAddress) external {
        if (newAddress == address(0)) revert InvalidTokenAddress();
        goodDollarAddress = newAddress;
    }

    /**
     * @notice Update CELO token address
     * @param newAddress New CELO token address
     */
    function setCeloAddress(address newAddress) external {
        celoAddress = newAddress;
    }

    // ========================================
    //   CREATE GROUPS
    // ========================================

    /**
     * @notice Create a new savings group
     * @param name Group name
     * @param description Group description
     * @param isPrivate Whether the group is private
     * @param targetAmount Target savings amount
     * @param memberLimit Maximum number of members
     * @param endDate Group end date (timestamp)
     * @param tokenType Token type (CELO or GSTAR)
     */
    function createGroup(
        string memory name,
        string memory description,
        bool isPrivate,
        uint256 targetAmount,
        uint256 memberLimit,
        uint256 endDate,
        ITsaroSafeData.TokenType tokenType
    ) external returns (uint256) {
        // Validation
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(name).length > 100) revert NameTooLong();
        if (bytes(description).length > 500) revert DescriptionTooLong();
        if (targetAmount == 0) revert InvalidTarget();
        if (memberLimit == 0) revert InvalidMemberLimit();
        if (memberLimit > 100) revert MemberLimitExceeded();
        if (endDate <= block.timestamp) revert InvalidEndDate();
        if (endDate > block.timestamp + 365 days) revert EndDateTooFar();

        uint256 groupId = nextGroupId++;

        // Create group
        groups[groupId] = Group({
            id: groupId,
            name: name,
            description: description,
            isPrivate: isPrivate,
            creator: msg.sender,
            targetAmount: targetAmount,
            currentAmount: 0,
            memberLimit: memberLimit,
            createdAt: block.timestamp,
            endDate: endDate,
            isActive: true,
            isCompleted: false,
            tokenType: tokenType
        });

        // Store token type
        groupTokenTypes[groupId] = tokenType;

        // Add creator as first member
        groupMembers[groupId][msg.sender] =
            Member({user: msg.sender, contribution: 0, lastContribution: 0, isActive: true, joinedAt: block.timestamp});

        groupMemberList[groupId].push(msg.sender);
        userGroups[msg.sender].push(groupId);

        // Initialize group goal
        groupGoals[groupId] = GroupGoal({
            groupId: groupId,
            targetAmount: targetAmount,
            currentAmount: 0,
            deadline: endDate,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0,
            progressPercentage: 0
        });

        groupGoalDeadlines[groupId] = endDate;

        emit GroupCreated(groupId, msg.sender, name, isPrivate, targetAmount, memberLimit, endDate);
        emit MemberJoined(groupId, msg.sender);
        emit GoalSet(groupId, targetAmount, endDate, block.timestamp);

        return groupId;
    }

    /**
     * @notice Update group metadata (only by creator)
     * @param groupId Group ID
     * @param name New group name
     * @param description New group description
     */
    function updateGroupMetadata(uint256 groupId, string memory name, string memory description)
        external
        groupExists(groupId)
        onlyGroupCreator(groupId)
        groupActive(groupId)
    {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(name).length > 100) revert NameTooLong();
        if (bytes(description).length > 500) revert DescriptionTooLong();

        groups[groupId].name = name;
        groups[groupId].description = description;

        emit GroupUpdated(groupId, "metadata", "updated");
    }

    /**
     * @notice Update group member limit (only by creator)
     * @param groupId Group ID
     * @param newLimit New member limit
     */
    function updateMemberLimit(uint256 groupId, uint256 newLimit)
        external
        groupExists(groupId)
        onlyGroupCreator(groupId)
        groupActive(groupId)
    {
        if (newLimit == 0) revert InvalidMemberLimit();
        if (newLimit > 100) revert MemberLimitExceeded();
        if (newLimit < groupMemberList[groupId].length) revert InvalidMemberLimit();

        groups[groupId].memberLimit = newLimit;
        emit GroupUpdated(groupId, "memberLimit", "updated");
    }

    /**
     * @notice Update group end date (only by creator)
     * @param groupId Group ID
     * @param newEndDate New end date
     */
    function updateEndDate(uint256 groupId, uint256 newEndDate)
        external
        groupExists(groupId)
        onlyGroupCreator(groupId)
        groupActive(groupId)
    {
        if (newEndDate <= block.timestamp) revert InvalidEndDate();
        if (newEndDate > block.timestamp + 365 days) revert EndDateTooFar();

        groups[groupId].endDate = newEndDate;
        emit GroupUpdated(groupId, "endDate", "updated");
    }

    /**
     * @notice Toggle group privacy (only by creator)
     * @param groupId Group ID
     */
    function toggleGroupPrivacy(uint256 groupId)
        external
        groupExists(groupId)
        onlyGroupCreator(groupId)
        groupActive(groupId)
    {
        groups[groupId].isPrivate = !groups[groupId].isPrivate;
        emit GroupUpdated(groupId, "privacy", groups[groupId].isPrivate ? "private" : "public");
    }

    /**
     * @notice Deactivate group (only by creator)
     * @param groupId Group ID
     */
    function deactivateGroup(uint256 groupId)
        external
        groupExists(groupId)
        onlyGroupCreator(groupId)
        groupActive(groupId)
    {
        groups[groupId].isActive = false;
        emit GroupUpdated(groupId, "status", "deactivated");
    }

    // ========================================
    //  JOIN/LEAVE GROUPS
    // ========================================

    /**
     * @notice Join an existing group
     * @param groupId Group ID to join
     */
    function joinGroup(uint256 groupId) external groupExists(groupId) groupActive(groupId) {
        Group storage group = groups[groupId];

        // Check if user is already a member
        if (groupMembers[groupId][msg.sender].isActive) revert AlreadyMember();

        // Check group capacity
        if (groupMemberList[groupId].length >= group.memberLimit) revert GroupAtCapacity();

        // Check if group has ended
        if (block.timestamp >= group.endDate) revert GroupEnded();

        // Check if group is completed
        if (group.isCompleted) revert GroupCompleted();

        // Add user as member
        groupMembers[groupId][msg.sender] =
            Member({user: msg.sender, contribution: 0, lastContribution: 0, isActive: true, joinedAt: block.timestamp});

        groupMemberList[groupId].push(msg.sender);
        userGroups[msg.sender].push(groupId);

        emit MemberJoined(groupId, msg.sender);
    }

    /**
     * @notice Leave a group
     * @param groupId Group ID to leave
     */
    function leaveGroup(uint256 groupId) external groupExists(groupId) onlyGroupMember(groupId) {
        Group storage group = groups[groupId];

        // Prevent creator from leaving (they must deactivate group instead)
        if (msg.sender == group.creator) revert CreatorCannotLeave();

        // Check if group has ended
        if (block.timestamp >= group.endDate) revert GroupEnded();

        // Check if group is completed
        if (group.isCompleted) revert GroupCompleted();

        // Mark member as inactive
        groupMembers[groupId][msg.sender].isActive = false;

        // Remove from member list
        address[] storage members = groupMemberList[groupId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == msg.sender) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        // Remove from user groups
        uint256[] storage userGroupList = userGroups[msg.sender];
        for (uint256 i = 0; i < userGroupList.length; i++) {
            if (userGroupList[i] == groupId) {
                userGroupList[i] = userGroupList[userGroupList.length - 1];
                userGroupList.pop();
                break;
            }
        }

        emit MemberLeft(groupId, msg.sender);
    }

    /**
     * @notice Remove a member from group (only by creator)
     * @param _groupId Group ID
     * @param _member Member address to remove
     */
    function removeMember(uint256 _groupId, address _member)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        if (_member == msg.sender) revert CannotRemoveSelf();
        if (!groupMembers[_groupId][_member].isActive) revert NotMember();

        // Mark member as inactive
        groupMembers[_groupId][_member].isActive = false;

        // Remove from member list
        address[] storage members = groupMemberList[_groupId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        // Remove from user groups
        uint256[] storage userGroupList = userGroups[_member];
        for (uint256 i = 0; i < userGroupList.length; i++) {
            if (userGroupList[i] == _groupId) {
                userGroupList[i] = userGroupList[userGroupList.length - 1];
                userGroupList.pop();
                break;
            }
        }

        emit MemberLeft(_groupId, _member);
    }

    // ========================================
    //  CONTRIBUTION TRACKING
    // ========================================

    /**
     * @notice Make a contribution to a group
     * @param _groupId Group ID
     * @param _amount Contribution amount
     * @param _description Contribution description
     */
    function makeContribution(uint256 _groupId, uint256 _amount, string memory _description)
        external
        groupExists(_groupId)
        onlyGroupMember(_groupId)
        groupActive(_groupId)
    {
        if (_amount == 0) revert InvalidAmount();
        if (bytes(_description).length > 200) revert DescriptionTooLong();

        Group storage group = groups[_groupId];
        if (block.timestamp >= group.endDate) revert GroupEnded();
        if (group.isCompleted) revert GroupCompleted();

        uint256 contributionId = nextContributionId++;

        // Create contribution history record
        ContributionHistory memory newContribution = ContributionHistory({
            contributionId: contributionId,
            member: msg.sender,
            groupId: _groupId,
            amount: _amount,
            timestamp: block.timestamp,
            description: _description,
            isVerified: false,
            tokenType: groups[_groupId].tokenType
        });

        // Add to group contributions
        groupContributions[_groupId].push(newContribution);

        // Update member contribution totals
        memberTotalContributions[msg.sender][_groupId]++;
        memberTotalAmount[msg.sender][_groupId] += _amount;

        // Update group totals
        groupTotalContributions[_groupId]++;
        groupTotalAmount[_groupId] += _amount;

        // Update group current amount
        group.currentAmount += _amount;

        // Update member's contribution in group
        groupMembers[_groupId][msg.sender].contribution += _amount;
        groupMembers[_groupId][msg.sender].lastContribution = block.timestamp;

        // Mark member as paid for the active round (if one is set)
        uint256 activeRound = groupActiveRound[_groupId];
        if (activeRound != 0) {
            roundPayments[_groupId][activeRound][msg.sender] = true;
        }

        // Update goal progress
        GroupGoal storage goal = groupGoals[_groupId];
        goal.currentAmount += _amount;
        goal.progressPercentage = (goal.currentAmount * 100) / goal.targetAmount;

        // Check if group target is reached
        if (group.currentAmount >= group.targetAmount) {
            group.isCompleted = true;
            goal.isCompleted = true;
            goal.completedAt = block.timestamp;
            emit GoalCompleted(_groupId, goal.targetAmount, goal.currentAmount, block.timestamp);
        }

        emit ContributionMade(contributionId, _groupId, msg.sender, _amount, _description, block.timestamp);
        emit ProgressUpdated(_groupId, goal.currentAmount, goal.targetAmount, goal.progressPercentage);
    }

    /**
     * @notice Make a contribution to a group using ERC20 tokens (CELO or G$)
     * @param _groupId Group ID
     * @param _amount Contribution amount in token units
     * @param _description Contribution description
     * @param _tokenType Token type (0 = CELO, 1 = G$)
     */
    function makeContributionWithToken(
        uint256 _groupId,
        uint256 _amount,
        string memory _description,
        uint8 _tokenType
    )
        external
        payable
        groupExists(_groupId)
        onlyGroupMember(_groupId)
        groupActive(_groupId)
    {
        if (_amount == 0) revert InvalidAmount();
        if (bytes(_description).length > 200) revert DescriptionTooLong();
        if (_tokenType > 1) revert InvalidAmount();

        Group storage group = groups[_groupId];
        if (block.timestamp >= group.endDate) revert GroupEnded();
        if (group.isCompleted) revert GroupCompleted();

        // Verify token type matches group's token type
        if (uint8(group.tokenType) != _tokenType) revert TokenTypeMismatch();

        // Handle token transfer based on token type
        if (_tokenType == 0) {
            // CELO transfer (native token)
            if (msg.value != _amount) revert InvalidAmount();
        } else if (_tokenType == 1) {
            // G$ (GoodDollar) transfer
            if (goodDollarAddress == address(0)) revert InvalidTokenAddress();
            
            // Check user's balance
            uint256 userBalance = IERC20(goodDollarAddress).balanceOf(msg.sender);
            if (userBalance < _amount) revert InvalidAmount();
            
            // Check allowance
            uint256 allowance = IERC20(goodDollarAddress).allowance(msg.sender, address(this));
            if (allowance < _amount) revert InsufficientAllowance();
            
            // Transfer G$ from user to contract
            bool success = IERC20(goodDollarAddress).transferFrom(msg.sender, address(this), _amount);
            if (!success) revert TokenTransferFailed();
        }

        uint256 contributionId = nextContributionId++;

        // Create contribution history record with token type
        ContributionHistory memory newContribution = ContributionHistory({
            contributionId: contributionId,
            member: msg.sender,
            groupId: _groupId,
            amount: _amount,
            timestamp: block.timestamp,
            description: _description,
            isVerified: false,
            tokenType: ITsaroSafeData.TokenType(_tokenType)
        });

        // Add to group contributions
        groupContributions[_groupId].push(newContribution);

        // Update member contribution totals
        memberTotalContributions[msg.sender][_groupId]++;
        memberTotalAmount[msg.sender][_groupId] += _amount;

        // Update group totals
        groupTotalContributions[_groupId]++;
        groupTotalAmount[_groupId] += _amount;

        // Update group current amount
        group.currentAmount += _amount;

        // Update member's contribution in group
        groupMembers[_groupId][msg.sender].contribution += _amount;
        groupMembers[_groupId][msg.sender].lastContribution = block.timestamp;

        // Mark member as paid for the active round (if one is set)
        uint256 activeRound = groupActiveRound[_groupId];
        if (activeRound != 0) {
            roundPayments[_groupId][activeRound][msg.sender] = true;
        }

        // Update goal progress
        GroupGoal storage goal = groupGoals[_groupId];
        goal.currentAmount += _amount;
        goal.progressPercentage = (goal.currentAmount * 100) / goal.targetAmount;

        // Check if group target is reached
        if (group.currentAmount >= group.targetAmount) {
            group.isCompleted = true;
            goal.isCompleted = true;
            goal.completedAt = block.timestamp;
            emit GoalCompleted(_groupId, goal.targetAmount, goal.currentAmount, block.timestamp);
        }

        emit ContributionMadeWithToken(
            contributionId,
            _groupId,
            msg.sender,
            _amount,
            _tokenType,
            _description,
            block.timestamp
        );
        emit ProgressUpdated(_groupId, goal.currentAmount, goal.targetAmount, goal.progressPercentage);
    }

    /**
     * @notice Verify a contribution (only by group creator)
     * @param _groupId Group ID
     * @param _contributionId Contribution ID to verify
     * @param _verified Whether to verify or unverify
     */
    function verifyContribution(uint256 _groupId, uint256 _contributionId, bool _verified)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
    {
        ContributionHistory[] storage contributions = groupContributions[_groupId];

        for (uint256 i = 0; i < contributions.length; i++) {
            if (contributions[i].contributionId == _contributionId) {
                contributions[i].isVerified = _verified;
                emit ContributionVerified(_contributionId, _groupId, contributions[i].member, _verified);
                return;
            }
        }

        revert ContributionNotFound();
    }

    /**
     * @notice Get contribution history for a group
     * @param _groupId Group ID
     * @param _offset Starting index
     * @param _limit Maximum number of contributions to return
     */
    function getGroupContributions(uint256 _groupId, uint256 _offset, uint256 _limit)
        external
        view
        groupExists(_groupId)
        returns (ContributionHistory[] memory)
    {
        if (_limit == 0 || _limit > 100) revert InvalidLimit();

        ContributionHistory[] storage contributions = groupContributions[_groupId];
        uint256 totalContributions = contributions.length;

        if (_offset >= totalContributions) {
            return new ContributionHistory[](0);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > totalContributions) {
            endIndex = totalContributions;
        }

        uint256 resultLength = endIndex - _offset;
        ContributionHistory[] memory result = new ContributionHistory[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = contributions[_offset + i];
        }

        return result;
    }

    /**
     * @notice Get member's contribution history for a group
     * @param _groupId Group ID
     * @param _member Member address
     * @param _offset Starting index
     * @param _limit Maximum number of contributions to return
     */
    function getMemberContributions(uint256 _groupId, address _member, uint256 _offset, uint256 _limit)
        external
        view
        groupExists(_groupId)
        returns (ContributionHistory[] memory)
    {
        if (_limit == 0 || _limit > 100) revert InvalidLimit();

        ContributionHistory[] storage contributions = groupContributions[_groupId];
        ContributionHistory[] memory memberContributions = new ContributionHistory[](contributions.length);

        uint256 memberCount = 0;
        for (uint256 i = 0; i < contributions.length; i++) {
            if (contributions[i].member == _member) {
                memberContributions[memberCount] = contributions[i];
                memberCount++;
            }
        }

        if (_offset >= memberCount) {
            return new ContributionHistory[](0);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > memberCount) {
            endIndex = memberCount;
        }

        uint256 resultLength = endIndex - _offset;
        ContributionHistory[] memory result = new ContributionHistory[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = memberContributions[_offset + i];
        }

        return result;
    }

    /**
     * @notice Get group contribution summary
     * @param _groupId Group ID
     */
    function getGroupContributionSummary(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (
            uint256 totalContributions,
            uint256 totalAmount,
            uint256 memberCount,
            uint256 lastContributionTime,
            uint256 averageContribution
        )
    {
        totalContributions = groupTotalContributions[_groupId];
        totalAmount = groupTotalAmount[_groupId];
        memberCount = groupMemberList[_groupId].length;

        ContributionHistory[] storage contributions = groupContributions[_groupId];
        if (contributions.length > 0) {
            lastContributionTime = contributions[contributions.length - 1].timestamp;
        }

        averageContribution = memberCount > 0 ? totalAmount / memberCount : 0;
    }

    /**
     * @notice Get member's contribution summary for a group
     * @param _groupId Group ID
     * @param _member Member address
     */
    function getMemberContributionSummary(uint256 _groupId, address _member)
        external
        view
        groupExists(_groupId)
        returns (
            uint256 totalContributions,
            uint256 totalAmount,
            uint256 lastContributionTime,
            uint256 averageContribution
        )
    {
        totalContributions = memberTotalContributions[_member][_groupId];
        totalAmount = memberTotalAmount[_member][_groupId];

        ContributionHistory[] storage contributions = groupContributions[_groupId];
        for (uint256 i = contributions.length; i > 0; i--) {
            if (contributions[i - 1].member == _member) {
                lastContributionTime = contributions[i - 1].timestamp;
                break;
            }
        }

        averageContribution = totalContributions > 0 ? totalAmount / totalContributions : 0;
    }

    // ========================================
    //   GOAL SETTING
    // ========================================

    /**
     * @notice Update group target amount (only by creator)
     * @param _groupId Group ID
     * @param _newTarget New target amount
     */
    function updateGroupTarget(uint256 _groupId, uint256 _newTarget)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        if (_newTarget == 0) revert InvalidTarget();
        if (_newTarget <= groups[_groupId].currentAmount) revert InvalidTarget();

        Group storage group = groups[_groupId];
        GroupGoal storage goal = groupGoals[_groupId];

        uint256 oldTarget = group.targetAmount;
        group.targetAmount = _newTarget;
        goal.targetAmount = _newTarget;

        // Recalculate progress percentage
        goal.progressPercentage = (goal.currentAmount * 100) / goal.targetAmount;

        emit GoalUpdated(_groupId, oldTarget, _newTarget, msg.sender);
        emit ProgressUpdated(_groupId, goal.currentAmount, goal.targetAmount, goal.progressPercentage);
    }

    /**
     * @notice Update group deadline (only by creator)
     * @param _groupId Group ID
     * @param _newDeadline New deadline timestamp
     */
    function updateGroupDeadline(uint256 _groupId, uint256 _newDeadline)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        if (_newDeadline <= block.timestamp) revert InvalidDeadline();
        if (_newDeadline > block.timestamp + 365 days) revert EndDateTooFar();

        Group storage group = groups[_groupId];
        GroupGoal storage goal = groupGoals[_groupId];

        group.endDate = _newDeadline;
        goal.deadline = _newDeadline;
        groupGoalDeadlines[_groupId] = _newDeadline;

        emit GroupUpdated(_groupId, "deadline", "updated");
    }

    /**
     * @notice Add a milestone to a group (only by creator)
     * @param _groupId Group ID
     * @param _targetAmount Milestone target amount
     * @param _description Milestone description
     */
    function addGroupMilestone(uint256 _groupId, uint256 _targetAmount, string memory _description)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        if (_targetAmount == 0) revert InvalidMilestone();
        if (_targetAmount > groups[_groupId].targetAmount) revert InvalidMilestone();
        if (bytes(_description).length > 200) revert DescriptionTooLong();

        uint256 milestoneId = nextMilestoneId++;

        GoalMilestone memory newMilestone = GoalMilestone({
            milestoneId: milestoneId,
            groupId: _groupId,
            targetAmount: _targetAmount,
            description: _description,
            isReached: false,
            reachedAt: 0,
            createdAt: block.timestamp
        });

        groupMilestones[_groupId].push(newMilestone);
    }

    /**
     * @notice Check and update milestone status
     * @param _groupId Group ID
     * @param _milestoneId Milestone ID
     */
    function checkMilestoneStatus(uint256 _groupId, uint256 _milestoneId) external groupExists(_groupId) {
        GoalMilestone[] storage milestones = groupMilestones[_groupId];
        GroupGoal storage goal = groupGoals[_groupId];

        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].milestoneId == _milestoneId) {
                if (!milestones[i].isReached && goal.currentAmount >= milestones[i].targetAmount) {
                    milestones[i].isReached = true;
                    milestones[i].reachedAt = block.timestamp;
                    emit MilestoneReached(_milestoneId, _groupId, milestones[i].targetAmount, block.timestamp);
                }
                return;
            }
        }

        revert MilestoneNotFound();
    }

    /**
     * @notice Get group goal information
     * @param _groupId Group ID
     */
    function getGroupGoal(uint256 _groupId) external view groupExists(_groupId) returns (GroupGoal memory) {
        return groupGoals[_groupId];
    }

    /**
     * @notice Get group progress information
     * @param _groupId Group ID
     */
    function getGroupProgress(uint256 _groupId) external view groupExists(_groupId) returns (GoalProgress memory) {
        GroupGoal storage goal = groupGoals[_groupId];

        uint256 daysRemaining = 0;
        if (goal.deadline > block.timestamp) {
            daysRemaining = (goal.deadline - block.timestamp) / 1 days;
        }

        uint256 averageDailyContribution = 0;
        if (daysRemaining > 0) {
            uint256 daysElapsed = (block.timestamp - goal.createdAt) / 1 days;
            if (daysElapsed > 0) {
                averageDailyContribution = goal.currentAmount / daysElapsed;
            }
        }

        bool isOnTrack = true;
        if (daysRemaining > 0 && averageDailyContribution > 0) {
            uint256 requiredDailyContribution = (goal.targetAmount - goal.currentAmount) / daysRemaining;
            isOnTrack = averageDailyContribution >= requiredDailyContribution;
        }

        return GoalProgress({
            groupId: _groupId,
            currentAmount: goal.currentAmount,
            targetAmount: goal.targetAmount,
            progressPercentage: goal.progressPercentage,
            daysRemaining: daysRemaining,
            averageDailyContribution: averageDailyContribution,
            isOnTrack: isOnTrack
        });
    }

    /**
     * @notice Get group milestones
     * @param _groupId Group ID
     */
    function getGroupMilestones(uint256 _groupId) external view groupExists(_groupId) returns (GoalMilestone[] memory) {
        return groupMilestones[_groupId];
    }

    /**
     * @notice Calculate progress percentage
     * @param _groupId Group ID
     */
    function calculateProgressPercentage(uint256 _groupId) external view groupExists(_groupId) returns (uint256) {
        GroupGoal storage goal = groupGoals[_groupId];
        return (goal.currentAmount * 100) / goal.targetAmount;
    }

    // ========================================
    //  ROUND PAYMENT HELPERS
    // ========================================

    /**
     * @notice Set the active round id for a group (only by creator)
     * @param _groupId Group ID
     * @param _roundId Round ID to mark as active
     */
    function setActiveRound(uint256 _groupId, uint256 _roundId)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
    {
        groupActiveRound[_groupId] = _roundId;
    }

    /**
     * @notice Get active round id for a group
     * @param _groupId Group ID
     */
    function getActiveRound(uint256 _groupId) external view groupExists(_groupId) returns (uint256) {
        return groupActiveRound[_groupId];
    }

    /**
     * @notice Check if a member has paid for a given round
     * @param _groupId Group ID
     * @param _roundId Round ID
     * @param _member Member address
     */
    function isMemberPaid(uint256 _groupId, uint256 _roundId, address _member)
        external
        view
        groupExists(_groupId)
        returns (bool)
    {
        return roundPayments[_groupId][_roundId][_member];
    }

    /**
     * @notice Get payment statuses for all members in a round
     * @param _groupId Group ID
     * @param _roundId Round ID
     * @return members Array of member addresses
     * @return statuses Array of booleans indicating paid status for each member
     */
    function getRoundPaymentStatuses(uint256 _groupId, uint256 _roundId)
        external
        view
        groupExists(_groupId)
        returns (address[] memory, bool[] memory)
    {
        address[] storage members = groupMemberList[_groupId];
        uint256 len = members.length;
        address[] memory addrs = new address[](len);
        bool[] memory statuses = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            addrs[i] = members[i];
            statuses[i] = roundPayments[_groupId][_roundId][members[i]];
        }

        return (addrs, statuses);
    }

    /**
     * @notice Count how many members have paid in a given round
     * @param _groupId Group ID
     * @param _roundId Round ID
     */
    function getRoundPaidCount(uint256 _groupId, uint256 _roundId)
        external
        view
        groupExists(_groupId)
        returns (uint256)
    {
        address[] storage members = groupMemberList[_groupId];
        uint256 count = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (roundPayments[_groupId][_roundId][members[i]]) {
                count++;
            }
        }
        return count;
    }

    // ========================================
    // QUERY FUNCTIONS
    // ========================================

    /**
     * @notice Get group information
     * @param _groupId Group ID
     */
    function getGroup(uint256 _groupId) external view groupExists(_groupId) returns (Group memory) {
        return groups[_groupId];
    }

    /**
     * @notice Get group members
     * @param _groupId Group ID
     */
    function getGroupMembers(uint256 _groupId) external view groupExists(_groupId) returns (address[] memory) {
        return groupMemberList[_groupId];
    }

    /**
     * @notice Get member information
     * @param _groupId Group ID
     * @param _member Member address
     */
    function getMemberInfo(uint256 _groupId, address _member)
        external
        view
        groupExists(_groupId)
        returns (Member memory)
    {
        return groupMembers[_groupId][_member];
    }

    /**
     * @notice Get user's groups
     * @param _user User address
     */
    function getUserGroups(address _user) external view returns (uint256[] memory) {
        return userGroups[_user];
    }

    /**
     * @notice Check if user is member of group
     * @param _groupId Group ID
     * @param _user User address
     */
    function isGroupMember(uint256 _groupId, address _user) external view groupExists(_groupId) returns (bool) {
        return groupMembers[_groupId][_user].isActive;
    }

    /**
     * @notice Get group statistics
     * @param _groupId Group ID
     */
    function getGroupStats(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (
            uint256 memberCount,
            uint256 currentAmount,
            uint256 targetAmount,
            uint256 progressPercentage,
            bool isActive,
            bool isCompleted
        )
    {
        Group memory group = groups[_groupId];
        memberCount = groupMemberList[_groupId].length;
        currentAmount = group.currentAmount;
        targetAmount = group.targetAmount;
        progressPercentage = targetAmount > 0 ? (currentAmount * 100) / targetAmount : 0;
        isActive = group.isActive;
        isCompleted = group.isCompleted;
    }

    /**
     * @notice Get all public groups (for discovery)
     * @param _offset Starting index
     * @param _limit Maximum number of groups to return
     */
    function getPublicGroups(uint256 _offset, uint256 _limit) external view returns (Group[] memory)     {
        if (_limit == 0 || _limit > 50) revert InvalidLimit();

        uint256 totalGroups = nextGroupId - 1;
        if (_offset >= totalGroups) {
            return new Group[](0);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > totalGroups) {
            endIndex = totalGroups;
        }

        uint256 resultLength = endIndex - _offset;
        Group[] memory publicGroups = new Group[](resultLength);

        uint256 resultIndex = 0;
        for (uint256 i = _offset + 1; i <= endIndex; i++) {
            if (!groups[i].isPrivate && groups[i].isActive) {
                publicGroups[resultIndex] = groups[i];
                resultIndex++;
            }
        }

        // Resize array to actual length
        assembly {
            mstore(publicGroups, resultIndex)
        }

        return publicGroups;
    }

    /**
     * @notice Get token type for a group
     * @param _groupId Group ID
     */
    function getGroupTokenType(uint256 _groupId) external view groupExists(_groupId) returns (TokenType) {
        return groups[_groupId].tokenType;
    }

    /**
     * @notice Get all public groups filtered by token type
     * @param _tokenType Token type to filter by (CELO or GSTAR)
     * @param _offset Starting index
     * @param _limit Maximum number of groups to return
     */
    function getPublicGroupsByTokenType(TokenType _tokenType, uint256 _offset, uint256 _limit)
        external
        view
        returns (Group[] memory)
    {
        if (_limit == 0 || _limit > 50) revert InvalidLimit();

        uint256 totalGroups = nextGroupId - 1;
        if (_offset >= totalGroups) {
            return new Group[](0);
        }

        // First pass: count matching groups
        uint256 matchCount = 0;
        for (uint256 i = 1; i <= totalGroups; i++) {
            if (!groups[i].isPrivate && groups[i].isActive && groups[i].tokenType == _tokenType) {
                matchCount++;
            }
        }

        if (_offset >= matchCount) {
            return new Group[](0);
        }

        uint256 endIndex = _offset + _limit;
        if (endIndex > matchCount) {
            endIndex = matchCount;
        }

        uint256 resultLength = endIndex - _offset;
        Group[] memory filteredGroups = new Group[](resultLength);

        // Second pass: collect matching groups
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        for (uint256 i = 1; i <= totalGroups && resultIndex < resultLength; i++) {
            if (!groups[i].isPrivate && groups[i].isActive && groups[i].tokenType == _tokenType) {
                if (currentIndex >= _offset) {
                    filteredGroups[resultIndex] = groups[i];
                    resultIndex++;
                }
                currentIndex++;
            }
        }

        return filteredGroups;
    }

    // ========================================
    // WITHDRAWAL FUNCTIONS
    // ========================================

    /**
     * @notice Withdraw a contribution from a group
     * @param _groupId Group ID
     * @param _contributionId Contribution ID to withdraw
     */
    function withdrawContribution(uint256 _groupId, uint256 _contributionId)
        external
        groupExists(_groupId)
        onlyGroupMember(_groupId)
    {
        // Find the contribution
        ContributionHistory[] storage contributions = groupContributions[_groupId];
        uint256 contributionIndex = type(uint256).max;
        uint256 withdrawalAmount;
        uint8 tokenType;

        for (uint256 i = 0; i < contributions.length; i++) {
            if (contributions[i].contributionId == _contributionId) {
                contributionIndex = i;
                withdrawalAmount = contributions[i].amount;
                tokenType = uint8(contributions[i].tokenType);
                break;
            }
        }

        if (contributionIndex == type(uint256).max) revert ContributionNotFound();

        // Verify the contribution belongs to the caller
        if (contributions[contributionIndex].member != msg.sender) revert NotMember();

        // Check if already withdrawn
        if (withdrawnContributions[_groupId][_contributionId]) revert ContributionAlreadyWithdrawn();

        // Get group info
        Group storage group = groups[_groupId];

        // Verify withdrawal is allowed (group must be completed or ended)
        if (group.isActive && block.timestamp < group.endDate) revert WithdrawalNotAllowed();

        // Mark as withdrawn
        withdrawnContributions[_groupId][_contributionId] = true;
        memberWithdrawnAmount[_groupId][msg.sender] += withdrawalAmount;

        // Update group totals
        group.currentAmount -= withdrawalAmount;

        // Transfer tokens back to member
        if (tokenType == 0) {
            // CELO transfer (native token)
            if (address(this).balance < withdrawalAmount) revert InsufficientContractBalance();
            (bool success, ) = msg.sender.call{value: withdrawalAmount}("");
            if (!success) revert WithdrawalFailed();
        } else if (tokenType == 1) {
            // G$ (GoodDollar) transfer
            if (goodDollarAddress == address(0)) revert InvalidTokenAddress();
            bool success = IERC20(goodDollarAddress).transfer(msg.sender, withdrawalAmount);
            if (!success) revert TokenTransferFailed();
        }

        emit WithdrawalCompleted(_groupId, _contributionId, msg.sender, withdrawalAmount, tokenType, block.timestamp);
    }

    /**
     * @notice Get total withdrawn amount for a member in a group
     * @param _groupId Group ID
     * @param _member Member address
     */
    function getMemberWithdrawnAmount(uint256 _groupId, address _member)
        external
        view
        groupExists(_groupId)
        returns (uint256)
    {
        return memberWithdrawnAmount[_groupId][_member];
    }

    /**
     * @notice Check if a contribution has been withdrawn
     * @param _groupId Group ID
     * @param _contributionId Contribution ID
     */
    function isContributionWithdrawn(uint256 _groupId, uint256 _contributionId)
        external
        view
        groupExists(_groupId)
        returns (bool)
    {
        return withdrawnContributions[_groupId][_contributionId];
    }

    /**
     * @notice Get withdrawable amount for a member in a group
     * @param _groupId Group ID
     * @param _member Member address
     */
    function getWithdrawableAmount(uint256 _groupId, address _member)
        external
        view
        groupExists(_groupId)
        returns (uint256)
    {
        ContributionHistory[] storage contributions = groupContributions[_groupId];

        uint256 totalWithdrawable = 0;

        for (uint256 i = 0; i < contributions.length; i++) {
            // Only count contributions from the member that haven't been withdrawn
            if (contributions[i].member == _member && !withdrawnContributions[_groupId][contributions[i].contributionId]) {
                totalWithdrawable += contributions[i].amount;
            }
        }

        return totalWithdrawable;
    }

    /**
     * @notice Receive CELO transfers
     */
    receive() external payable {}
}