// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/ITsaroSafeData.sol";

/**
 * @title TsaroSafe
 * @notice Main TsaroSafe contract for decentralized savings groups
 * @dev Implements Create Groups and Join/Leave Groups milestones
 */
contract TsaroSafe is ITsaroSafeData {
    enum GroupType {
        ProjectPool,
        CircleSavings
    }

      enum ContributionFrequency {
        Daily,
        Weekly,
        BiWeekly,
        Monthly
    }

    mapping(uint256 => GroupType) public groupTypes;

    // ========================================
    // CIRCLE ROSTER MANAGEMENT
    // ========================================

      struct CircleRoster {
        uint256 groupId;
        address[] memberOrder;
        uint256 currentRoundIndex;
        uint256 nextPayoutTimestamp;
        ContributionFrequency frequency;
        uint256 contributionAmount;
        bool isActive;
    }

    struct RosterChange {
        uint256 changeId;
        uint256 groupId;
        address member;
        string changeType; // "added", "removed", "reordered"
        uint256 timestamp;
    }


// Circle roster mappings
    mapping(uint256 => CircleRoster) public circleRosters;
    mapping(uint256 => RosterChange[]) public rosterChangeHistory;
    mapping(uint256 => uint256) public rosterChangeCount;
    mapping(uint256 => mapping(address => uint256)) public memberRosterPosition;
    mapping(uint256 => uint256) public circlePayoutHistory;
    mapping(uint256 => uint256) public lastPayoutTimestamp;

    // State variables
    uint256 public nextGroupId = 1;
    uint256 public nextContributionId = 1;
    uint256 public nextMilestoneId = 1;

    // Mappings
    mapping(uint256 => Group) public groups;
    mapping(uint256 => mapping(address => Member)) public groupMembers;
    mapping(uint256 => address[]) public groupMemberList;
    mapping(address => uint256[]) public userGroups;

    // Contribution tracking mappings
    mapping(uint256 => ContributionHistory[]) public groupContributions;
    mapping(uint256 => uint256) public groupTotalContributions;
    mapping(uint256 => uint256) public groupTotalAmount;
    mapping(address => mapping(uint256 => uint256)) public memberTotalContributions;
    mapping(address => mapping(uint256 => uint256)) public memberTotalAmount;

    // Round payment tracking
    // groupId => active round id
    mapping(uint256 => uint256) public groupActiveRound;
    // groupId => roundId => member => paid
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private roundPayments;

    // Goal setting mappings
    mapping(uint256 => GroupGoal) public groupGoals;
    mapping(uint256 => GoalMilestone[]) public groupMilestones;
    mapping(uint256 => uint256) public groupGoalDeadlines;

    // Events
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

    // Contribution tracking events
    event ContributionMade(
        uint256 indexed contributionId,
        uint256 indexed groupId,
        address indexed member,
        uint256 amount,
        string description,
        uint256 timestamp
    );
    event ContributionVerified(
        uint256 indexed contributionId, uint256 indexed groupId, address indexed member, bool verified
    );

    // Goal setting events
    event GoalSet(uint256 indexed groupId, uint256 targetAmount, uint256 deadline, uint256 createdAt);
    event GoalUpdated(uint256 indexed groupId, uint256 oldTarget, uint256 newTarget, address indexed updater);
    event GoalCompleted(uint256 indexed groupId, uint256 targetAmount, uint256 actualAmount, uint256 completedAt);
    event MilestoneReached(
        uint256 indexed milestoneId, uint256 indexed groupId, uint256 targetAmount, uint256 reachedAt
    );
    event ProgressUpdated(
        uint256 indexed groupId, uint256 currentAmount, uint256 targetAmount, uint256 progressPercentage
    );


  event CircleCreated(
        uint256 indexed groupId,
        address[] roster,
        uint256 contributionAmount,
        uint8 frequency,
        uint256 nextPayoutTimestamp
    );

    event RosterUpdated(
        uint256 indexed groupId,
        uint256 indexed changeId,
        address[] newRoster,
        uint256 currentRoundIndex,
        uint256 timestamp
    );

    event RosterMemberAdded(
        uint256 indexed groupId,
        address indexed member,
        uint256 position,
        uint256 timestamp
    );

    event RosterMemberRemoved(
        uint256 indexed groupId,
        address indexed member,
        uint256 timestamp
    );

    event ScheduleUpdated(
        uint256 indexed groupId,
        uint256 contributionAmount,
        uint8 frequency,
        uint256 nextPayoutTimestamp,
        address indexed updatedBy
    );

 event RosterReordered(
        uint256 indexed groupId,
        address[] newOrder,
        uint256 timestamp
    );

    event PayoutScheduled(
        uint256 indexed groupId,
        address indexed recipient,
        uint256 amount,
        uint256 scheduledTime,
        uint256 roundIndex
    );

    event ContributionRoundProgressed(
        uint256 indexed groupId,
        uint256 previousRound,
        uint256 newRound,
        address indexed nextRecipient,
        uint256 timestamp
    );
    // Modifiers
    modifier onlyGroupCreator(uint256 _groupId) {
        require(groups[_groupId].creator == msg.sender, "Only group creator can perform this action");
        _;
    }

    modifier onlyGroupMember(uint256 _groupId) {
        require(groupMembers[_groupId][msg.sender].isActive, "Not a group member");
        _;
    }

    modifier groupExists(uint256 _groupId) {
        require(groups[_groupId].id != 0, "Group does not exist");
        _;
    }

    modifier groupActive(uint256 _groupId) {
        require(groups[_groupId].isActive, "Group is not active");
        _;
    }

    // ========================================
    //   CREATE GROUPS
    // ========================================

    /**
     * @notice Create a new savings group
     * @param _name Group name
     * @param _description Group description
     * @param _isPrivate Whether the group is private
     * @param _targetAmount Target savings amount
     * @param _memberLimit Maximum number of members
     * @param _endDate Group end date (timestamp)
     */
    function createGroup(
        string memory _name,
        string memory _description,
        bool _isPrivate,
        uint256 _targetAmount,
        uint256 _memberLimit,
        uint256 _endDate
    ) external returns (uint256) {
        // Validation
        require(bytes(_name).length > 0, "Group name cannot be empty");
        require(bytes(_name).length <= 100, "Group name too long");
        require(bytes(_description).length <= 500, "Description too long");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_memberLimit > 0, "Member limit must be greater than 0");
        require(_memberLimit <= 100, "Member limit cannot exceed 100");
        require(_endDate > block.timestamp, "End date must be in the future");
        require(_endDate <= block.timestamp + 365 days, "End date cannot exceed 1 year");

        uint256 groupId = nextGroupId++;

        // Create group
        groups[groupId] = Group({
            id: groupId,
            name: _name,
            description: _description,
            isPrivate: _isPrivate,
            creator: msg.sender,
            targetAmount: _targetAmount,
            currentAmount: 0,
            memberLimit: _memberLimit,
            createdAt: block.timestamp,
            endDate: _endDate,
            isActive: true,
            isCompleted: false
        });

        // Add creator as first member
        groupMembers[groupId][msg.sender] =
            Member({user: msg.sender, contribution: 0, lastContribution: 0, isActive: true, joinedAt: block.timestamp});

        groupMemberList[groupId].push(msg.sender);
        userGroups[msg.sender].push(groupId);

        // Initialize group goal
        groupGoals[groupId] = GroupGoal({
            groupId: groupId,
            targetAmount: _targetAmount,
            currentAmount: 0,
            deadline: _endDate,
            isCompleted: false,
            createdAt: block.timestamp,
            completedAt: 0,
            progressPercentage: 0
        });

        groupGoalDeadlines[groupId] = _endDate;

        emit GroupCreated(groupId, msg.sender, _name, _isPrivate, _targetAmount, _memberLimit, _endDate);
        emit MemberJoined(groupId, msg.sender);
        emit GoalSet(groupId, _targetAmount, _endDate, block.timestamp);

        return groupId;
    }

    /**
     * @notice Update group metadata (only by creator)
     * @param _groupId Group ID
     * @param _name New group name
     * @param _description New group description
     */
    function updateGroupMetadata(uint256 _groupId, string memory _name, string memory _description)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(bytes(_name).length > 0, "Group name cannot be empty");
        require(bytes(_name).length <= 100, "Group name too long");
        require(bytes(_description).length <= 500, "Description too long");

        groups[_groupId].name = _name;
        groups[_groupId].description = _description;

        emit GroupUpdated(_groupId, "metadata", "updated");
    }

    /**
     * @notice Update group member limit (only by creator)
     * @param _groupId Group ID
     * @param _newLimit New member limit
     */
    function updateMemberLimit(uint256 _groupId, uint256 _newLimit)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(_newLimit > 0, "Member limit must be greater than 0");
        require(_newLimit <= 100, "Member limit cannot exceed 100");
        require(_newLimit >= groupMemberList[_groupId].length, "New limit cannot be less than current members");

        groups[_groupId].memberLimit = _newLimit;
        emit GroupUpdated(_groupId, "memberLimit", "updated");
    }

    /**
     * @notice Update group end date (only by creator)
     * @param _groupId Group ID
     * @param _newEndDate New end date
     */
    function updateEndDate(uint256 _groupId, uint256 _newEndDate)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(_newEndDate > block.timestamp, "End date must be in the future");
        require(_newEndDate <= block.timestamp + 365 days, "End date cannot exceed 1 year");

        groups[_groupId].endDate = _newEndDate;
        emit GroupUpdated(_groupId, "endDate", "updated");
    }

    /**
     * @notice Toggle group privacy (only by creator)
     * @param _groupId Group ID
     */
    function toggleGroupPrivacy(uint256 _groupId)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        groups[_groupId].isPrivate = !groups[_groupId].isPrivate;
        emit GroupUpdated(_groupId, "privacy", groups[_groupId].isPrivate ? "private" : "public");
    }

    /**
     * @notice Deactivate group (only by creator)
     * @param _groupId Group ID
     */
    function deactivateGroup(uint256 _groupId)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        groups[_groupId].isActive = false;
        emit GroupUpdated(_groupId, "status", "deactivated");
    }

    // ========================================
    //  JOIN/LEAVE GROUPS
    // ========================================

    /**
     * @notice Join an existing group
     * @param _groupId Group ID to join
     */
    function joinGroup(uint256 _groupId) external groupExists(_groupId) groupActive(_groupId) {
        Group storage group = groups[_groupId];

        // Check if user is already a member
        require(!groupMembers[_groupId][msg.sender].isActive, "Already a member of this group");

        // Check group capacity
        require(groupMemberList[_groupId].length < group.memberLimit, "Group is at capacity");

        // Check if group has ended
        require(block.timestamp < group.endDate, "Group has ended");

        // Check if group is completed
        require(!group.isCompleted, "Group is already completed");

        // Add user as member
        groupMembers[_groupId][msg.sender] =
            Member({user: msg.sender, contribution: 0, lastContribution: 0, isActive: true, joinedAt: block.timestamp});

        groupMemberList[_groupId].push(msg.sender);
        userGroups[msg.sender].push(_groupId);

        emit MemberJoined(_groupId, msg.sender);
    }

    /**
     * @notice Leave a group
     * @param _groupId Group ID to leave
     */
    function leaveGroup(uint256 _groupId) external groupExists(_groupId) onlyGroupMember(_groupId) {
        Group storage group = groups[_groupId];

        // Prevent creator from leaving (they must deactivate group instead)
        require(msg.sender != group.creator, "Creator cannot leave group. Use deactivateGroup() instead");

        // Check if group has ended
        require(block.timestamp < group.endDate, "Cannot leave group after it has ended");

        // Check if group is completed
        require(!group.isCompleted, "Cannot leave completed group");

        // Mark member as inactive
        groupMembers[_groupId][msg.sender].isActive = false;

        // Remove from member list
        address[] storage members = groupMemberList[_groupId];
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
            if (userGroupList[i] == _groupId) {
                userGroupList[i] = userGroupList[userGroupList.length - 1];
                userGroupList.pop();
                break;
            }
        }

        emit MemberLeft(_groupId, msg.sender);
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
        require(_member != msg.sender, "Cannot remove yourself");
        require(groupMembers[_groupId][_member].isActive, "Member is not active");

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
        require(_amount > 0, "Contribution amount must be greater than 0");
        require(bytes(_description).length <= 200, "Description too long");

        Group storage group = groups[_groupId];
        require(block.timestamp < group.endDate, "Group has ended");
        require(!group.isCompleted, "Group is already completed");

        uint256 contributionId = nextContributionId++;

        // Create contribution history record
        ContributionHistory memory newContribution = ContributionHistory({
            contributionId: contributionId,
            member: msg.sender,
            groupId: _groupId,
            amount: _amount,
            timestamp: block.timestamp,
            description: _description,
            isVerified: false
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

        revert("Contribution not found");
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
        require(_limit > 0 && _limit <= 100, "Invalid limit");

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
        require(_limit > 0 && _limit <= 100, "Invalid limit");

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
        require(_newTarget > 0, "Target must be greater than 0");
        require(_newTarget > groups[_groupId].currentAmount, "New target must be greater than current amount");

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
        require(_newDeadline > block.timestamp, "Deadline must be in the future");
        require(_newDeadline <= block.timestamp + 365 days, "Deadline cannot exceed 1 year");

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
        require(_targetAmount > 0, "Milestone target must be greater than 0");
        require(_targetAmount <= groups[_groupId].targetAmount, "Milestone cannot exceed group target");
        require(bytes(_description).length <= 200, "Description too long");

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

        revert("Milestone not found");
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
    function getPublicGroups(uint256 _offset, uint256 _limit) external view returns (Group[] memory) {
        require(_limit > 0 && _limit <= 50, "Invalid limit");

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
     * @notice Initialize circle roster for a group
     * @param _groupId Group ID
     * @param _roster Initial member order
     * @param _contributionAmount Fixed contribution amount per cycle
     * @param _frequency Contribution frequency
     * @param _firstPayoutTime Timestamp of first payout
     */
    function initializeCircleRoster(
        uint256 _groupId,
        address[] memory _roster,
        uint256 _contributionAmount,
        ContributionFrequency _frequency,
        uint256 _firstPayoutTime
    )
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(_roster.length > 0, "Roster cannot be empty");
        require(_roster.length <= 100, "Roster exceeds maximum size");
        require(_contributionAmount > 0, "Contribution amount must be greater than 0");
        require(_firstPayoutTime > block.timestamp, "First payout time must be in future");

        // Validate all roster members are group members
        for (uint256 i = 0; i < _roster.length; i++) {
            require(
                groupMembers[_groupId][_roster[i]].isActive,
                "All roster members must be active group members"
            );
        }

        // Create circle roster
        circleRosters[_groupId] = CircleRoster({
            groupId: _groupId,
            memberOrder: _roster,
            currentRoundIndex: 0,
            nextPayoutTimestamp: _firstPayoutTime,
            frequency: _frequency,
            contributionAmount: _contributionAmount,
            isActive: true
        });

        // Set member positions
        for (uint256 i = 0; i < _roster.length; i++) {
            memberRosterPosition[_groupId][_roster[i]] = i;
        }

        emit CircleCreated(
            _groupId,
            _roster,
            _contributionAmount,
            uint8(_frequency),
            _firstPayoutTime
        );
    }

    /**
     * @notice Update circle schedule (contribution amount and frequency)
     * @param _groupId Group ID
     * @param _newContributionAmount New contribution amount
     * @param _newFrequency New contribution frequency
     */
    function updateCircleSchedule(
        uint256 _groupId,
        uint256 _newContributionAmount,
        ContributionFrequency _newFrequency
    )
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(circleRosters[_groupId].isActive, "Circle roster not initialized");
        require(_newContributionAmount > 0, "Contribution amount must be greater than 0");

        CircleRoster storage roster = circleRosters[_groupId];
        roster.contributionAmount = _newContributionAmount;
        roster.frequency = _newFrequency;

        // Calculate next payout based on frequency
        uint256 frequencyDuration = _getFrequencyDuration(_newFrequency);
        roster.nextPayoutTimestamp = block.timestamp + frequencyDuration;

        emit ScheduleUpdated(
            _groupId,
            _newContributionAmount,
            uint8(_newFrequency),
            roster.nextPayoutTimestamp,
            msg.sender
        );
    }

    /**
     * @notice Add member to circle roster
     * @param _groupId Group ID
     * @param _member Member address to add
     * @param _position Position in roster (optional, defaults to end)
     */
    function addMemberToRoster(
        uint256 _groupId,
        address _member,
        uint256 _position
    )
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(circleRosters[_groupId].isActive, "Circle roster not initialized");
        require(groupMembers[_groupId][_member].isActive, "Member must be active group member");
        require(
            memberRosterPosition[_groupId][_member] == 0 || circleRosters[_groupId].memberOrder[0] != _member,
            "Member already in roster"
        );

        CircleRoster storage roster = circleRosters[_groupId];
        uint256 insertPosition = _position < roster.memberOrder.length ? _position : roster.memberOrder.length;

        // Insert member at position
        roster.memberOrder.push();
        for (uint256 i = roster.memberOrder.length - 1; i > insertPosition; i--) {
            roster.memberOrder[i] = roster.memberOrder[i - 1];
            memberRosterPosition[_groupId][roster.memberOrder[i]] = i;
        }
        roster.memberOrder[insertPosition] = _member;
        memberRosterPosition[_groupId][_member] = insertPosition;

        // Record change
        uint256 changeId = rosterChangeCount[_groupId]++;
        rosterChangeHistory[_groupId].push(RosterChange({
            changeId: changeId,
            groupId: _groupId,
            member: _member,
            changeType: "added",
            timestamp: block.timestamp
        }));

        emit RosterMemberAdded(_groupId, _member, insertPosition, block.timestamp);
        emit RosterUpdated(
            _groupId,
            changeId,
            roster.memberOrder,
            roster.currentRoundIndex,
            block.timestamp
        );
    }

    /**
     * @notice Remove member from circle roster
     * @param _groupId Group ID
     * @param _member Member address to remove
     */
    function removeMemberFromRoster(
        uint256 _groupId,
        address _member
    )
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(circleRosters[_groupId].isActive, "Circle roster not initialized");

        CircleRoster storage roster = circleRosters[_groupId];
        // uint256 position = memberRosterPosition[_groupId][_member];

        // Find and remove member
        bool found = false;
        for (uint256 i = 0; i < roster.memberOrder.length; i++) {
            if (roster.memberOrder[i] == _member) {
                // Remove from array
                roster.memberOrder[i] = roster.memberOrder[roster.memberOrder.length - 1];
                roster.memberOrder.pop();
                
                // Update positions
                for (uint256 j = i; j < roster.memberOrder.length; j++) {
                    memberRosterPosition[_groupId][roster.memberOrder[j]] = j;
                }
                
                memberRosterPosition[_groupId][_member] = 0;
                found = true;
                break;
            }
        }

        require(found, "Member not found in roster");

        // Record change
        uint256 changeId = rosterChangeCount[_groupId]++;
        rosterChangeHistory[_groupId].push(RosterChange({
            changeId: changeId,
            groupId: _groupId,
            member: _member,
            changeType: "removed",
            timestamp: block.timestamp
        }));

        emit RosterMemberRemoved(_groupId, _member, block.timestamp);
        emit RosterUpdated(
            _groupId,
            changeId,
            roster.memberOrder,
            roster.currentRoundIndex,
            block.timestamp
        );
    }

    /**
     * @notice Reorder roster members
     * @param _groupId Group ID
     * @param _newOrder New member order
     */
    function reorderRoster(
        uint256 _groupId,
        address[] memory _newOrder
    )
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
        groupActive(_groupId)
    {
        require(circleRosters[_groupId].isActive, "Circle roster not initialized");
        require(_newOrder.length == circleRosters[_groupId].memberOrder.length, "Order length mismatch");

        CircleRoster storage roster = circleRosters[_groupId];

        // Validate all members are present
        for (uint256 i = 0; i < _newOrder.length; i++) {
            require(groupMembers[_groupId][_newOrder[i]].isActive, "Invalid member in new order");
        }

        roster.memberOrder = _newOrder;

        // Update positions
        for (uint256 i = 0; i < _newOrder.length; i++) {
            memberRosterPosition[_groupId][_newOrder[i]] = i;
        }

        // Record change
        uint256 changeId = rosterChangeCount[_groupId]++;
        rosterChangeHistory[_groupId].push(RosterChange({
            changeId: changeId,
            groupId: _groupId,
            member: address(0),
            changeType: "reordered",
            timestamp: block.timestamp
        }));

        emit RosterReordered(_groupId, _newOrder, block.timestamp);
        emit RosterUpdated(
            _groupId,
            changeId,
            _newOrder,
            roster.currentRoundIndex,
            block.timestamp
        );
    }

    /**
     * @notice Progress to next round in circle
     * @param _groupId Group ID
     */
    function progressRound(uint256 _groupId)
        external
        groupExists(_groupId)
        onlyGroupCreator(_groupId)
    {
        require(circleRosters[_groupId].isActive, "Circle roster not initialized");
        require(
            block.timestamp >= circleRosters[_groupId].nextPayoutTimestamp,
            "Payout time has not reached"
        );

        CircleRoster storage roster = circleRosters[_groupId];
        uint256 previousRound = roster.currentRoundIndex;

        // Move to next member
        roster.currentRoundIndex = (roster.currentRoundIndex + 1) % roster.memberOrder.length;
        address nextRecipient = roster.memberOrder[roster.currentRoundIndex];

        // Update next payout timestamp
        uint256 frequencyDuration = _getFrequencyDuration(roster.frequency);
        roster.nextPayoutTimestamp = block.timestamp + frequencyDuration;

        // Update payout history
        circlePayoutHistory[_groupId]++;
        lastPayoutTimestamp[_groupId] = block.timestamp;

        emit ContributionRoundProgressed(
            _groupId,
            previousRound,
            roster.currentRoundIndex,
            nextRecipient,
            block.timestamp
        );

        emit PayoutScheduled(
            _groupId,
            nextRecipient,
            roster.contributionAmount,
            roster.nextPayoutTimestamp,
            roster.currentRoundIndex
        );
    }

    /**
     * @notice Get circle roster information
     * @param _groupId Group ID
     */
    function getCircleRoster(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (CircleRoster memory)
    {
        return circleRosters[_groupId];
    }

    /**
     * @notice Get current recipient in circle
     * @param _groupId Group ID
     */
    function getCurrentCircleRecipient(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (address)
    {
        CircleRoster storage roster = circleRosters[_groupId];
        require(roster.isActive, "Circle roster not initialized");
        return roster.memberOrder[roster.currentRoundIndex];
    }

    /**
     * @notice Get next recipient in circle
     * @param _groupId Group ID
     */
    function getNextCircleRecipient(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (address)
    {
        CircleRoster storage roster = circleRosters[_groupId];
        require(roster.isActive, "Circle roster not initialized");
        uint256 nextIndex = (roster.currentRoundIndex + 1) % roster.memberOrder.length;
        return roster.memberOrder[nextIndex];
    }

    /**
     * @notice Get roster change history
     * @param _groupId Group ID
     */
    function getRosterChangeHistory(uint256 _groupId)
        external
        view
        groupExists(_groupId)
        returns (RosterChange[] memory)
    {
        return rosterChangeHistory[_groupId];
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    /**
     * @notice Get frequency duration in seconds
     * @param _frequency Contribution frequency enum
     */
    function _getFrequencyDuration(ContributionFrequency _frequency)
        internal
        pure
        returns (uint256)
    {
        if (_frequency == ContributionFrequency.Daily) {
            return 1 days;
        } else if (_frequency == ContributionFrequency.Weekly) {
            return 7 days;
        } else if (_frequency == ContributionFrequency.BiWeekly) {
            return 14 days;
        } else if (_frequency == ContributionFrequency.Monthly) {
            return 30 days;
        } else {
            revert("Invalid frequency");
        }
    }
}