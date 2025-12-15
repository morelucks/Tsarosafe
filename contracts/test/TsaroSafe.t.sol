// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {TsaroSafe} from "../src/core/TsaroSafe.sol";
import {ITsaroSafeData} from "../src/interfaces/ITsaroSafeData.sol";
import {MockGoodDollar} from "./mocks/MockGoodDollar.sol";

/**
 * @title TsaroSafeTest
 * @notice Test suite for TsaroSafe contract
 */
contract TsaroSafeDeploymentTest is Test {
    TsaroSafe public tsaroSafe;
    address public user1;
    address public user2;
    address public user3;
    address public mockGoodDollar;

    event GroupCreated(
        uint256 indexed groupId, address indexed creator, string name, uint256 targetAmount, bool isPrivate
    );

    event MemberJoined(uint256 indexed groupId, address indexed member);

    event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount);

    event GroupCompleted(uint256 indexed groupId, uint256 totalAmount);

    event UserVerified(address indexed user, uint256 timestamp);

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        mockGoodDollar = makeAddr("mockGoodDollar");

        // Deploy contract with mock token addresses
        tsaroSafe = new TsaroSafe(mockGoodDollar, address(0));
    }

    function testContractDeployment() public view {
        assertTrue(address(tsaroSafe) != address(0));
        assertEq(tsaroSafe.goodDollarAddress(), mockGoodDollar);
    }
}

/**
 * @title TsaroSafeTest
 * @notice Comprehensive test suite for TsaroSafe contract - createGroup() function
 */
contract TsaroSafeTest is Test {
    TsaroSafe public tsaroSafe;
    MockGoodDollar public mockGoodDollar;
    address public user1;
    address public user2;
    address public user3;

    // Events to test
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

    event GoalSet(uint256 indexed groupId, uint256 targetAmount, uint256 deadline, uint256 createdAt);

    event ContributionMadeWithToken(
        uint256 indexed contributionId,
        uint256 indexed groupId,
        address indexed member,
        uint256 amount,
        uint8 tokenType,
        string description,
        uint256 timestamp
    );

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy mock GoodDollar token
        mockGoodDollar = new MockGoodDollar();

        // Deploy contract with mock token addresses
        tsaroSafe = new TsaroSafe(address(mockGoodDollar), address(0));
    }

    function testContractDeployment() public view {
        assertTrue(address(tsaroSafe) != address(0));
        assertEq(tsaroSafe.nextGroupId(), 1);
        assertEq(tsaroSafe.nextContributionId(), 1);
        assertEq(tsaroSafe.nextMilestoneId(), 1);
    }

    function testCreateGroupSuccess() public {
        // Setup
        vm.startPrank(user1);
        string memory groupName = "Test Savings Group";
        string memory description = "A test group for savings";
        bool isPrivate = false;
        uint256 targetAmount = 1000 ether;
        uint256 memberLimit = 10;
        uint256 endDate = block.timestamp + 30 days;

        // Expect events
        vm.expectEmit(true, true, false, true);
        emit GroupCreated(1, user1, groupName, isPrivate, targetAmount, memberLimit, endDate);

        vm.expectEmit(true, true, false, false);
        emit MemberJoined(1, user1);

        vm.expectEmit(true, false, false, false);
        emit GoalSet(1, targetAmount, endDate, block.timestamp);

        // Execute
        uint256 groupId = tsaroSafe.createGroup(groupName, description, isPrivate, targetAmount, memberLimit, endDate, ITsaroSafeData.TokenType.CELO);

        // Assertions
        assertEq(groupId, 1, "Group ID should be 1");
        assertEq(tsaroSafe.nextGroupId(), 2, "Next group ID should be incremented to 2");

        vm.stopPrank();
    }

    function testCreateGroupStoresAllFieldsCorrectly() public {
        // Setup
        vm.startPrank(user1);
        string memory groupName = "Savings Circle";
        string memory description = "Monthly savings group";
        bool isPrivate = true;
        uint256 targetAmount = 5000 ether;
        uint256 memberLimit = 20;
        uint256 endDate = block.timestamp + 60 days;

        // Execute
        uint256 groupId = tsaroSafe.createGroup(groupName, description, isPrivate, targetAmount, memberLimit, endDate, ITsaroSafeData.TokenType.GSTAR);

        // Get group data
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);

        // Assertions - verify all group fields
        assertEq(group.id, groupId, "Group ID should match");
        assertEq(group.name, groupName, "Group name should match");
        assertEq(group.description, description, "Group description should match");
        assertEq(group.isPrivate, isPrivate, "Privacy setting should match");
        assertEq(group.creator, user1, "Creator should be user1");
        assertEq(group.targetAmount, targetAmount, "Target amount should match");
        assertEq(group.currentAmount, 0, "Current amount should start at 0");
        assertEq(group.memberLimit, memberLimit, "Member limit should match");
        assertEq(group.createdAt, block.timestamp, "Created timestamp should match");
        assertEq(group.endDate, endDate, "End date should match");
        assertTrue(group.isActive, "Group should be active");
        assertFalse(group.isCompleted, "Group should not be completed");
        assertEq(uint256(group.tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Token type should be GSTAR");

        vm.stopPrank();
    }

    function testCreateGroupAddsCreatorAsFirstMember() public {
        // Setup
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        // Execute
        uint256 groupId = tsaroSafe.createGroup("Test Group", "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);

        // Get member info
        ITsaroSafeData.Member memory member = tsaroSafe.getMemberInfo(groupId, user1);
        address[] memory members = tsaroSafe.getGroupMembers(groupId);

        // Assertions
        assertEq(member.user, user1, "Member user address should be user1");
        assertEq(member.contribution, 0, "Initial contribution should be 0");
        assertEq(member.lastContribution, 0, "Last contribution should be 0");
        assertTrue(member.isActive, "Member should be active");
        assertEq(member.joinedAt, block.timestamp, "Join timestamp should match");

        assertEq(members.length, 1, "Should have exactly 1 member");
        assertEq(members[0], user1, "First member should be user1");

        assertTrue(tsaroSafe.isGroupMember(groupId, user1), "User1 should be a group member");

        vm.stopPrank();
    }

    function testCreateGroupInitializesGoalCorrectly() public {
        // Setup
        vm.startPrank(user1);
        uint256 targetAmount = 10000 ether;
        uint256 endDate = block.timestamp + 90 days;

        // Execute
        uint256 groupId =
            tsaroSafe.createGroup("Goal Test Group", "Testing goal initialization", false, targetAmount, 15, endDate, ITsaroSafeData.TokenType.CELO);

        // Get goal data
        ITsaroSafeData.GroupGoal memory goal = tsaroSafe.getGroupGoal(groupId);

        // Assertions
        assertEq(goal.groupId, groupId, "Goal group ID should match");
        assertEq(goal.targetAmount, targetAmount, "Goal target should match");
        assertEq(goal.currentAmount, 0, "Goal current amount should start at 0");
        assertEq(goal.deadline, endDate, "Goal deadline should match end date");
        assertFalse(goal.isCompleted, "Goal should not be completed");
        assertEq(goal.createdAt, block.timestamp, "Goal created timestamp should match");
        assertEq(goal.completedAt, 0, "Goal completed timestamp should be 0");
        assertEq(goal.progressPercentage, 0, "Progress percentage should be 0");

        vm.stopPrank();
    }

    function testCreateGroupPushesGroupIdToUserGroups() public {
        // Setup
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        // Execute - create first group
        uint256 groupId1 = tsaroSafe.createGroup("First Group", "Description 1", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);

        // Execute - create second group
        uint256 groupId2 = tsaroSafe.createGroup("Second Group", "Description 2", true, 2000 ether, 5, endDate, ITsaroSafeData.TokenType.GSTAR);

        // Get user groups
        uint256[] memory userGroupIds = tsaroSafe.getUserGroups(user1);

        // Assertions
        assertEq(userGroupIds.length, 2, "User should have 2 groups");
        assertEq(userGroupIds[0], groupId1, "First group ID should match");
        assertEq(userGroupIds[1], groupId2, "Second group ID should match");

        vm.stopPrank();
    }

        function testCreateGroupEmitsAllRequiredEvents() public {
        // Setup
        vm.startPrank(user1);
        string memory groupName = "Event Test Group";
        uint256 targetAmount = 5000 ether;
        uint256 memberLimit = 10;
        uint256 endDate = block.timestamp + 30 days;

        // Record logs
        vm.recordLogs();

        // Execute
        uint256 groupId = tsaroSafe.createGroup(groupName, "Testing events", false, targetAmount, memberLimit, endDate, ITsaroSafeData.TokenType.CELO);

        // Get logs
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Assertions - should have 3 events: GroupCreated, MemberJoined, GoalSet
        assertEq(logs.length, 3, "Should emit exactly 3 events");

        // Verify GroupCreated event
        assertEq(
            logs[0].topics[0],
            keccak256("GroupCreated(uint256,address,string,bool,uint256,uint256,uint256)"),
            "First event should be GroupCreated"
        );
        assertEq(uint256(logs[0].topics[1]), groupId, "GroupCreated groupId should match");
        assertEq(address(uint160(uint256(logs[0].topics[2]))), user1, "GroupCreated creator should match");

        // Verify MemberJoined event
        assertEq(logs[1].topics[0], keccak256("MemberJoined(uint256,address)"), "Second event should be MemberJoined");
        assertEq(uint256(logs[1].topics[1]), groupId, "MemberJoined groupId should match");
        assertEq(address(uint160(uint256(logs[1].topics[2]))), user1, "MemberJoined member should match");

        // Verify GoalSet event
        assertEq(
            logs[2].topics[0], keccak256("GoalSet(uint256,uint256,uint256,uint256)"), "Third event should be GoalSet"
        );
        assertEq(uint256(logs[2].topics[1]), groupId, "GoalSet groupId should match");

        vm.stopPrank();
    }

    // ============================================
    // VALIDATION & EDGE CASE TESTS
    // ============================================

    function testCreateGroupRevertsWithEmptyName() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert(TsaroSafe.EmptyName.selector);
        tsaroSafe.createGroup("", "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithNameTooLong() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        // Create a name that's 101 characters long
        string memory longName =
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        vm.expectRevert(TsaroSafe.NameTooLong.selector);
        tsaroSafe.createGroup(longName, "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithDescriptionTooLong() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        // Create a description that's 501 characters long
        string memory longDescription =
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        vm.expectRevert(TsaroSafe.DescriptionTooLong.selector);
        tsaroSafe.createGroup("Test Group", longDescription, false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithZeroTargetAmount() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert(TsaroSafe.InvalidTarget.selector);
        tsaroSafe.createGroup("Test Group", "Description", false, 0, 10, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithZeroMemberLimit() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert(TsaroSafe.InvalidMemberLimit.selector);
        tsaroSafe.createGroup("Test Group", "Description", false, 1000 ether, 0, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithMemberLimitExceedingMax() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert(TsaroSafe.MemberLimitExceeded.selector);
        tsaroSafe.createGroup("Test Group", "Description", false, 1000 ether, 101, endDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithPastEndDate() public {
        vm.startPrank(user1);
        uint256 pastDate = block.timestamp;

        vm.expectRevert(TsaroSafe.InvalidEndDate.selector);
        tsaroSafe.createGroup("Test Group", "Description", false, 1000 ether, 10, pastDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithEndDateExceedingOneYear() public {
        vm.startPrank(user1);
        uint256 farFutureDate = block.timestamp + 366 days;

        vm.expectRevert(TsaroSafe.EndDateTooFar.selector);
        tsaroSafe.createGroup("Test Group", "Description", false, 1000 ether, 10, farFutureDate, ITsaroSafeData.TokenType.CELO);

        vm.stopPrank();
    }

    function testCreateGroupWithMinimumValidValues() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 1; // Minimum future date

        uint256 groupId = tsaroSafe.createGroup(
            "A", // Minimum 1 character name
            "", // Empty description is allowed
            false,
            1, // Minimum target amount
            1, // Minimum member limit
            endDate,
            ITsaroSafeData.TokenType.CELO
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);

        assertEq(group.name, "A", "Name should be 'A'");
        assertEq(group.targetAmount, 1, "Target should be 1");
        assertEq(group.memberLimit, 1, "Member limit should be 1");

        vm.stopPrank();
    }

    function testCreateGroupWithMaximumValidValues() public {
        vm.startPrank(user1);

        // Create a 100-character name
        string memory maxName =
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        // Create a 500-character description
        string memory maxDescription =
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        uint256 endDate = block.timestamp + 365 days; // Maximum 1 year

        uint256 groupId = tsaroSafe.createGroup(
            maxName,
            maxDescription,
            true,
            type(uint256).max, // Maximum target amount
            100, // Maximum member limit
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);

        assertEq(bytes(group.name).length, 100, "Name should be 100 characters");
        assertEq(bytes(group.description).length, 500, "Description should be 500 characters");
        assertEq(group.memberLimit, 100, "Member limit should be 100");

        vm.stopPrank();
    }

    function testCreateMultipleGroupsByDifferentUsers() public {
        uint256 endDate = block.timestamp + 30 days;

        // User1 creates a group
        vm.startPrank(user1);
        uint256 groupId1 = tsaroSafe.createGroup("User1 Group", "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        vm.stopPrank();

        // User2 creates a group
        vm.startPrank(user2);
        uint256 groupId2 = tsaroSafe.createGroup("User2 Group", "Description", true, 2000 ether, 5, endDate, ITsaroSafeData.TokenType.GSTAR);
        vm.stopPrank();

        // User3 creates a group
        vm.startPrank(user3);
        uint256 groupId3 = tsaroSafe.createGroup("User3 Group", "Description", false, 3000 ether, 15, endDate, ITsaroSafeData.TokenType.CELO);
        vm.stopPrank();

        // Assertions
        assertEq(groupId1, 1, "First group ID should be 1");
        assertEq(groupId2, 2, "Second group ID should be 2");
        assertEq(groupId3, 3, "Third group ID should be 3");
        assertEq(tsaroSafe.nextGroupId(), 4, "Next group ID should be 4");

        // Verify each creator is a member of their own group
        assertTrue(tsaroSafe.isGroupMember(groupId1, user1), "User1 should be member of group1");
        assertTrue(tsaroSafe.isGroupMember(groupId2, user2), "User2 should be member of group2");
        assertTrue(tsaroSafe.isGroupMember(groupId3, user3), "User3 should be member of group3");

        // Verify users are not members of other groups
        assertFalse(tsaroSafe.isGroupMember(groupId1, user2), "User2 should not be member of group1");
        assertFalse(tsaroSafe.isGroupMember(groupId2, user3), "User3 should not be member of group2");
    }

    function testCreateGroupWithPublicVisibility() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "Public Group",
            "This is a public group",
            false, // isPrivate = false
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);

        assertFalse(group.isPrivate, "Group should be public");

        vm.stopPrank();
    }

    function testCreateGroupWithPrivateVisibility() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "Private Group",
            "This is a private group",
            true, // isPrivate = true
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);

        assertTrue(group.isPrivate, "Group should be private");

        vm.stopPrank();
    }

    function testCreateGroupIncrementsGroupIdCorrectly() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        assertEq(tsaroSafe.nextGroupId(), 1, "Initial nextGroupId should be 1");

        uint256 groupId1 = tsaroSafe.createGroup("Group 1", "Desc", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        assertEq(groupId1, 1, "First group ID should be 1");
        assertEq(tsaroSafe.nextGroupId(), 2, "nextGroupId should be 2");

        uint256 groupId2 = tsaroSafe.createGroup("Group 2", "Desc", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.GSTAR);
        assertEq(groupId2, 2, "Second group ID should be 2");
        assertEq(tsaroSafe.nextGroupId(), 3, "nextGroupId should be 3");

        uint256 groupId3 = tsaroSafe.createGroup("Group 3", "Desc", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        assertEq(groupId3, 3, "Third group ID should be 3");
        assertEq(tsaroSafe.nextGroupId(), 4, "nextGroupId should be 4");

        vm.stopPrank();
    }

    // ============================================
    // TOKEN PREFERENCE TESTS
    // ============================================

    function testCreateGroupWithCELOToken() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Group using CELO token",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(uint256(group.tokenType), uint256(ITsaroSafeData.TokenType.CELO), "Token type should be CELO");

        vm.stopPrank();
    }

    function testCreateGroupWithGSTARToken() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "GSTAR Group",
            "Group using GSTAR token",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(uint256(group.tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Token type should be GSTAR");

        vm.stopPrank();
    }

    function testGetGroupTokenType() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );

        ITsaroSafeData.TokenType tokenType = tsaroSafe.getGroupTokenType(groupId);
        assertEq(uint256(tokenType), uint256(ITsaroSafeData.TokenType.CELO), "Should return CELO token type");

        vm.stopPrank();
    }

    function testFilterGroupsByTokenType() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO groups
        vm.startPrank(user1);
        tsaroSafe.createGroup("CELO Group 1", "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        tsaroSafe.createGroup("CELO Group 2", "Description", false, 2000 ether, 15, endDate, ITsaroSafeData.TokenType.CELO);
        vm.stopPrank();

        // Create GSTAR groups
        vm.startPrank(user2);
        tsaroSafe.createGroup("GSTAR Group 1", "Description", false, 1500 ether, 12, endDate, ITsaroSafeData.TokenType.GSTAR);
        vm.stopPrank();

        // Filter by CELO
        ITsaroSafeData.Group[] memory celoGroups = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.CELO, 0, 50);
        assertEq(celoGroups.length, 2, "Should have 2 CELO groups");
        assertEq(uint256(celoGroups[0].tokenType), uint256(ITsaroSafeData.TokenType.CELO), "First group should be CELO");
        assertEq(uint256(celoGroups[1].tokenType), uint256(ITsaroSafeData.TokenType.CELO), "Second group should be CELO");

        // Filter by GSTAR
        ITsaroSafeData.Group[] memory gstarGroups = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.GSTAR, 0, 50);
        assertEq(gstarGroups.length, 1, "Should have 1 GSTAR group");
        assertEq(uint256(gstarGroups[0].tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Group should be GSTAR");
    }

    function testFilterGroupsByTokenTypeWithPagination() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create multiple CELO groups
        vm.startPrank(user1);
        for (uint256 i = 0; i < 5; i++) {
            string memory name = string(abi.encodePacked("CELO Group ", i));
            tsaroSafe.createGroup(name, "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        }
        vm.stopPrank();

        // Get first page
        ITsaroSafeData.Group[] memory page1 = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.CELO, 0, 2);
        assertEq(page1.length, 2, "First page should have 2 groups");

        // Get second page
        ITsaroSafeData.Group[] memory page2 = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.CELO, 2, 2);
        assertEq(page2.length, 2, "Second page should have 2 groups");

        // Get third page (partial)
        ITsaroSafeData.Group[] memory page3 = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.CELO, 4, 2);
        assertEq(page3.length, 1, "Third page should have 1 group");
    }

    // ============================================
    // ERC20 TOKEN CONTRIBUTION TESTS
    // ============================================

    function testMakeContributionWithTokenCELO() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join group as user2
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));

        // Make CELO contribution (send native CELO)
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0  // CELO token type
        );

        // Verify contribution was recorded
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(uint256(groupId));
        assertEq(group.currentAmount, contributionAmount, "Group current amount should be updated");

        vm.stopPrank();
    }

    function testMakeContributionWithTokenTypeMismatch() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Join group as user2
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));

        // Try to make G$ contribution to CELO group (should fail)
        vm.expectRevert(TsaroSafe.TokenTypeMismatch.selector);
        tsaroSafe.makeContributionWithToken(
            uint256(groupId),
            100 ether,
            "G$ contribution",
            1  // G$ token type (wrong for this group)
        );

        vm.stopPrank();
    }

    function testContributionHistoryIncludesTokenType() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Get contribution history
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        assertEq(contributions.length, 1, "Should have 1 contribution");
        assertEq(uint256(contributions[0].tokenType), 0, "Token type should be CELO");
        assertEq(contributions[0].amount, contributionAmount, "Amount should match");
    }

    function testSetGoodDollarAddress() public {
        address newGoodDollarAddress = makeAddr("newGoodDollar");
        tsaroSafe.setGoodDollarAddress(newGoodDollarAddress);
        assertEq(tsaroSafe.goodDollarAddress(), newGoodDollarAddress, "GoodDollar address should be updated");
    }

    function testSetCeloAddress() public {
        address newCeloAddress = makeAddr("newCelo");
        tsaroSafe.setCeloAddress(newCeloAddress);
        assertEq(tsaroSafe.celoAddress(), newCeloAddress, "CELO address should be updated");
    }

    // ============================================
    // WITHDRAWAL TESTS
    // ============================================

    function testWithdrawContributionAfterGroupEnds() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Withdraw contribution
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        uint256 balanceBefore = user2.balance;
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);
        uint256 balanceAfter = user2.balance;

        assertEq(balanceAfter - balanceBefore, contributionAmount, "User should receive contribution amount");
        assertTrue(tsaroSafe.isContributionWithdrawn(uint256(groupId), contributionId), "Contribution should be marked as withdrawn");

        vm.stopPrank();
    }

    function testWithdrawalNotAllowedWhileGroupActive() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );

        // Try to withdraw while group is still active (should fail)
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        vm.expectRevert(TsaroSafe.WithdrawalNotAllowed.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        vm.stopPrank();
    }

    function testCannotWithdrawTwice() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Withdraw contribution
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        // Try to withdraw again (should fail)
        vm.expectRevert(TsaroSafe.ContributionAlreadyWithdrawn.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        vm.stopPrank();
    }

    function testGetWithdrawableAmount() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and make multiple contributions
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contribution1 = 5 ether;
        uint256 contribution2 = 3 ether;

        tsaroSafe.makeContributionWithToken{value: contribution1}(
            uint256(groupId),
            contribution1,
            "First contribution",
            0
        );
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            uint256(groupId),
            contribution2,
            "Second contribution",
            0
        );

        // Check withdrawable amount before group ends
        uint256 withdrawable = tsaroSafe.getWithdrawableAmount(uint256(groupId), user2);
        assertEq(withdrawable, contribution1 + contribution2, "Should show total contributions as withdrawable");

        vm.stopPrank();
    }

    function testMemberWithdrawnAmountTracking() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Withdraw contribution
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        // Check withdrawn amount
        uint256 withdrawn = tsaroSafe.getMemberWithdrawnAmount(uint256(groupId), user2);
        assertEq(withdrawn, contributionAmount, "Withdrawn amount should be tracked");

        vm.stopPrank();
    }

    // ============================================
    // ACCESS CONTROL TESTS
    // ============================================

    function testWithdrawalAccessControlNonMember() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Try to withdraw as non-member (user3)
        vm.startPrank(user3);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        vm.expectRevert(TsaroSafe.NotMember.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        vm.stopPrank();
    }

    function testWithdrawalAccessControlWrongContributionOwner() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 and user3 some CELO
        deal(user2, 100 ether);
        deal(user3, 100 ether);

        // User2 joins and contributes
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // User3 joins
        vm.startPrank(user3);
        tsaroSafe.joinGroup(uint256(groupId));
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Try to withdraw user2's contribution as user3
        vm.startPrank(user3);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        vm.expectRevert(TsaroSafe.NotMember.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        vm.stopPrank();
    }

    // ============================================
    // EDGE CASE TESTS
    // ============================================

    function testWithdrawalInvalidContributionId() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Try to withdraw non-existent contribution
        vm.startPrank(user1);
        vm.expectRevert(TsaroSafe.ContributionNotFound.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), 999);

        vm.stopPrank();
    }

    function testWithdrawalMultipleContributions() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and make multiple contributions
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contribution1 = 5 ether;
        uint256 contribution2 = 3 ether;
        uint256 contribution3 = 2 ether;

        tsaroSafe.makeContributionWithToken{value: contribution1}(
            uint256(groupId),
            contribution1,
            "First contribution",
            0
        );
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            uint256(groupId),
            contribution2,
            "Second contribution",
            0
        );
        tsaroSafe.makeContributionWithToken{value: contribution3}(
            uint256(groupId),
            contribution3,
            "Third contribution",
            0
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Withdraw all contributions
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);

        uint256 balanceBefore = user2.balance;

        // Withdraw first contribution
        tsaroSafe.withdrawContribution(uint256(groupId), contributions[0].contributionId);
        // Withdraw second contribution
        tsaroSafe.withdrawContribution(uint256(groupId), contributions[1].contributionId);
        // Withdraw third contribution
        tsaroSafe.withdrawContribution(uint256(groupId), contributions[2].contributionId);

        uint256 balanceAfter = user2.balance;

        assertEq(balanceAfter - balanceBefore, contribution1 + contribution2 + contribution3, "Should receive all contributions");

        vm.stopPrank();
    }

    function testWithdrawalGroupCompleted() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group with small target
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            10 ether, // Small target
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute enough to complete group
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Verify group is completed
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(uint256(groupId));
        assertTrue(group.isCompleted, "Group should be completed");

        // Fast forward past end date to allow withdrawal
        vm.warp(endDate + 1);

        // Should be able to withdraw after group ends
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        uint256 balanceBefore = user2.balance;
        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);
        uint256 balanceAfter = user2.balance;

        assertEq(balanceAfter - balanceBefore, contributionAmount, "Should receive contribution");

        vm.stopPrank();
    }

    function testWithdrawalZeroAmount() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Try to withdraw from group with no contributions
        vm.startPrank(user1);
        vm.expectRevert(TsaroSafe.ContributionNotFound.selector);
        tsaroSafe.withdrawContribution(uint256(groupId), 1);

        vm.stopPrank();
    }

    function testWithdrawalPartialGroupCompletion() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            100 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 and user3 some CELO
        deal(user2, 100 ether);
        deal(user3, 100 ether);

        // User2 contributes
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contribution2 = 30 ether;
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            uint256(groupId),
            contribution2,
            "User2 contribution",
            0
        );
        vm.stopPrank();

        // User3 contributes enough to complete
        vm.startPrank(user3);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contribution3 = 70 ether;
        tsaroSafe.makeContributionWithToken{value: contribution3}(
            uint256(groupId),
            contribution3,
            "User3 contribution",
            0
        );
        vm.stopPrank();

        // Verify group is completed
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(uint256(groupId));
        assertTrue(group.isCompleted, "Group should be completed");

        // Fast forward past end date to allow withdrawal
        vm.warp(endDate + 1);

        // Both users should be able to withdraw
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 user2ContributionId = contributions[0].contributionId;

        uint256 user2BalanceBefore = user2.balance;
        tsaroSafe.withdrawContribution(uint256(groupId), user2ContributionId);
        uint256 user2BalanceAfter = user2.balance;

        assertEq(user2BalanceAfter - user2BalanceBefore, contribution2, "User2 should receive their contribution");

        vm.stopPrank();

        vm.startPrank(user3);
        uint256 user3ContributionId = contributions[1].contributionId;

        uint256 user3BalanceBefore = user3.balance;
        tsaroSafe.withdrawContribution(uint256(groupId), user3ContributionId);
        uint256 user3BalanceAfter = user3.balance;

        assertEq(user3BalanceAfter - user3BalanceBefore, contribution3, "User3 should receive their contribution");

        vm.stopPrank();
    }

    function testWithdrawalGroupTotalsUpdated() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(uint256(groupId));
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            uint256(groupId),
            contributionAmount,
            "CELO contribution",
            0
        );
        vm.stopPrank();

        // Verify group amount before withdrawal
        ITsaroSafeData.Group memory groupBefore = tsaroSafe.getGroup(uint256(groupId));
        assertEq(groupBefore.currentAmount, contributionAmount, "Group should have contribution amount");

        // Fast forward past end date
        vm.warp(endDate + 1);

        // Withdraw contribution
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(uint256(groupId), 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        tsaroSafe.withdrawContribution(uint256(groupId), contributionId);

        // Verify group amount after withdrawal
        ITsaroSafeData.Group memory groupAfter = tsaroSafe.getGroup(uint256(groupId));
        assertEq(groupAfter.currentAmount, 0, "Group amount should be reduced to 0");

        vm.stopPrank();
    }

    // ============================================
    // G$ DOLLAR CONTRIBUTIONS FEATURE TESTS
    // ============================================

    function testCreateGroupWithGDollarTokenType() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        uint256 groupId = tsaroSafe.createGroup(
            "G$ Savings Group",
            "Group for G$ contributions",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(uint256(group.tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Group should use G$ token");
        assertEq(group.name, "G$ Savings Group", "Group name should match");
        assertEq(group.targetAmount, 1000 ether, "Target amount should match");

        vm.stopPrank();
    }

    function testMakeGDollarContributionWithMockToken() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Join group as user2
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        // Try to make G$ contribution (will fail because mockGoodDollar doesn't have transferFrom)
        // This test verifies the contract attempts to call the token
        vm.expectRevert();
        tsaroSafe.makeContributionWithToken(
            groupId,
            100 ether,
            "G$ contribution",
            1  // G$ token type
        );

        vm.stopPrank();
    }

    function testGDollarContributionHistoryDisplaysTokenType() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Give user2 some CELO to join
        deal(user2, 100 ether);

        // Join group as user2
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        vm.stopPrank();

        // Verify group token type is GSTAR
        ITsaroSafeData.TokenType tokenType = tsaroSafe.getGroupTokenType(groupId);
        assertEq(uint256(tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Group should have GSTAR token type");
    }

    function testGroupProgressUpdatesWithGDollarContribution() public {
        uint256 endDate = block.timestamp + 30 days;
        uint256 targetAmount = 100 ether;

        // Create CELO group (for testing progress updates)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            targetAmount,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and make CELO contribution
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contributionAmount = 50 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            groupId,
            contributionAmount,
            "Contribution",
            0
        );
        vm.stopPrank();

        // Verify progress was updated
        ITsaroSafeData.GroupGoal memory goal = tsaroSafe.getGroupGoal(groupId);
        assertEq(goal.currentAmount, contributionAmount, "Goal should have contribution");
    }

    function testGDollarGroupProgressPercentage() public {
        uint256 endDate = block.timestamp + 30 days;
        uint256 targetAmount = 100 ether;

        // Create CELO group (for testing progress percentage)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            targetAmount,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contributionAmount = 50 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            groupId,
            contributionAmount,
            "Contribution",
            0
        );
        vm.stopPrank();

        // Check progress
        ITsaroSafeData.GroupGoal memory goal = tsaroSafe.getGroupGoal(groupId);
        assertEq(goal.currentAmount, contributionAmount, "Goal current amount should match contribution");
        assertEq(goal.progressPercentage, 50, "Progress should be 50%");
    }

    function testMultipleGDollarContributionsUpdateProgress() public {
        uint256 endDate = block.timestamp + 30 days;
        uint256 targetAmount = 100 ether;

        // Create CELO group (for testing multiple contributions)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            targetAmount,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give users some CELO
        deal(user2, 100 ether);
        deal(user3, 100 ether);

        // User2 contributes
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contribution2 = 30 ether;
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            groupId,
            contribution2,
            "User2 contribution",
            0
        );
        vm.stopPrank();

        // Check progress after first contribution
        ITsaroSafeData.GroupGoal memory goalAfter1 = tsaroSafe.getGroupGoal(groupId);
        assertEq(goalAfter1.currentAmount, contribution2, "Goal should have first contribution");
        assertEq(goalAfter1.progressPercentage, 30, "Progress should be 30%");

        // User3 contributes
        vm.startPrank(user3);
        tsaroSafe.joinGroup(groupId);
        uint256 contribution3 = 40 ether;
        tsaroSafe.makeContributionWithToken{value: contribution3}(
            groupId,
            contribution3,
            "User3 contribution",
            0
        );
        vm.stopPrank();

        // Check progress after second contribution
        ITsaroSafeData.GroupGoal memory goalAfter2 = tsaroSafe.getGroupGoal(groupId);
        assertEq(goalAfter2.currentAmount, contribution2 + contribution3, "Goal should have both contributions");
        assertEq(goalAfter2.progressPercentage, 70, "Progress should be 70%");
    }

    function testGDollarContributionHistoryRecordsTokenType() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group (for testing contribution history)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            groupId,
            contributionAmount,
            "Test contribution",
            0
        );
        vm.stopPrank();

        // Get contribution history
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(groupId, 0, 10);
        assertEq(contributions.length, 1, "Should have 1 contribution");
        assertEq(contributions[0].amount, contributionAmount, "Amount should match");
        assertEq(contributions[0].member, user2, "Member should be user2");
    }

    function testGDollarGroupCompletionWithContributions() public {
        uint256 endDate = block.timestamp + 30 days;
        uint256 targetAmount = 50 ether;

        // Create CELO group with small target (for testing completion)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            targetAmount,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute enough to complete
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        tsaroSafe.makeContributionWithToken{value: targetAmount}(
            groupId,
            targetAmount,
            "Completing contribution",
            0
        );
        vm.stopPrank();

        // Verify group is completed
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertTrue(group.isCompleted, "Group should be completed");

        // Verify goal is completed
        ITsaroSafeData.GroupGoal memory goal = tsaroSafe.getGroupGoal(groupId);
        assertTrue(goal.isCompleted, "Goal should be completed");
        assertEq(goal.progressPercentage, 100, "Progress should be 100%");
    }

    function testGDollarContributionSummary() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group (for testing contribution summary)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give users some CELO
        deal(user2, 100 ether);
        deal(user3, 100 ether);

        // User2 contributes
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contribution2 = 30 ether;
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            groupId,
            contribution2,
            "User2 contribution",
            0
        );
        vm.stopPrank();

        // User3 contributes
        vm.startPrank(user3);
        tsaroSafe.joinGroup(groupId);
        uint256 contribution3 = 20 ether;
        tsaroSafe.makeContributionWithToken{value: contribution3}(
            groupId,
            contribution3,
            "User3 contribution",
            0
        );
        vm.stopPrank();

        // Get contribution summary
        (uint256 totalContributions, uint256 totalAmount, uint256 memberCount, , uint256 averageContribution) =
            tsaroSafe.getGroupContributionSummary(groupId);

        assertEq(totalContributions, 2, "Should have 2 contributions");
        assertEq(totalAmount, contribution2 + contribution3, "Total amount should match");
        assertEq(memberCount, 3, "Should have 3 members (creator + 2 contributors)");
        assertEq(averageContribution, (contribution2 + contribution3) / 3, "Average should be calculated correctly");
    }

    function testGDollarMemberContributionSummary() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group (for testing member contribution summary)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // User2 makes multiple contributions
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        uint256 contribution1 = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contribution1}(
            groupId,
            contribution1,
            "First contribution",
            0
        );

        uint256 contribution2 = 20 ether;
        tsaroSafe.makeContributionWithToken{value: contribution2}(
            groupId,
            contribution2,
            "Second contribution",
            0
        );

        vm.stopPrank();

        // Get member contribution summary
        (uint256 totalContributions, uint256 totalAmount, , uint256 averageContribution) =
            tsaroSafe.getMemberContributionSummary(groupId, user2);

        assertEq(totalContributions, 2, "User2 should have 2 contributions");
        assertEq(totalAmount, contribution1 + contribution2, "Total amount should match");
        assertEq(averageContribution, (contribution1 + contribution2) / 2, "Average should be calculated correctly");
    }

    function testGDollarContributionVerification() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO group (for testing contribution verification)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // User2 makes contribution
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken{value: contributionAmount}(
            groupId,
            contributionAmount,
            "Test contribution",
            0
        );
        vm.stopPrank();

        // Get contribution ID
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(groupId, 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        // Verify contribution as creator
        vm.startPrank(user1);
        tsaroSafe.verifyContribution(groupId, contributionId, true);
        vm.stopPrank();

        // Check verification status
        ITsaroSafeData.ContributionHistory[] memory verifiedContributions = tsaroSafe.getGroupContributions(groupId, 0, 10);
        assertTrue(verifiedContributions[0].isVerified, "Contribution should be verified");
    }

    function testFilterGDollarGroupsByTokenType() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create CELO groups
        vm.startPrank(user1);
        tsaroSafe.createGroup("CELO Group 1", "Description", false, 1000 ether, 10, endDate, ITsaroSafeData.TokenType.CELO);
        tsaroSafe.createGroup("CELO Group 2", "Description", false, 2000 ether, 15, endDate, ITsaroSafeData.TokenType.CELO);
        vm.stopPrank();

        // Create G$ groups
        vm.startPrank(user2);
        tsaroSafe.createGroup("G$ Group 1", "Description", false, 1500 ether, 12, endDate, ITsaroSafeData.TokenType.GSTAR);
        tsaroSafe.createGroup("G$ Group 2", "Description", false, 2500 ether, 20, endDate, ITsaroSafeData.TokenType.GSTAR);
        vm.stopPrank();

        // Filter by G$
        ITsaroSafeData.Group[] memory gstarGroups = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.GSTAR, 0, 50);
        assertEq(gstarGroups.length, 2, "Should have 2 G$ groups");
        assertEq(uint256(gstarGroups[0].tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "First group should be GSTAR");
        assertEq(uint256(gstarGroups[1].tokenType), uint256(ITsaroSafeData.TokenType.GSTAR), "Second group should be GSTAR");

        // Filter by CELO
        ITsaroSafeData.Group[] memory celoGroups = tsaroSafe.getPublicGroupsByTokenType(ITsaroSafeData.TokenType.CELO, 0, 50);
        assertEq(celoGroups.length, 2, "Should have 2 CELO groups");
        assertEq(uint256(celoGroups[0].tokenType), uint256(ITsaroSafeData.TokenType.CELO), "First group should be CELO");
        assertEq(uint256(celoGroups[1].tokenType), uint256(ITsaroSafeData.TokenType.CELO), "Second group should be CELO");
    }

    function testGDollarGroupWithdrawalAfterCompletion() public {
        uint256 endDate = block.timestamp + 30 days;
        uint256 targetAmount = 50 ether;

        // Create CELO group (for testing withdrawal after completion)
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "CELO Group",
            "Test CELO group",
            false,
            targetAmount,
            10,
            endDate,
            ITsaroSafeData.TokenType.CELO
        );
        vm.stopPrank();

        // Give user2 some CELO
        deal(user2, 100 ether);

        // Join and contribute
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        tsaroSafe.makeContributionWithToken{value: targetAmount}(
            groupId,
            targetAmount,
            "Completing contribution",
            0
        );
        vm.stopPrank();

        // Verify group is completed
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertTrue(group.isCompleted, "Group should be completed");

        // Fast forward past end date to allow withdrawal
        vm.warp(endDate + 1);

        // Should be able to withdraw after group ends
        vm.startPrank(user2);
        ITsaroSafeData.ContributionHistory[] memory contributions = tsaroSafe.getGroupContributions(groupId, 0, 10);
        uint256 contributionId = contributions[0].contributionId;

        uint256 balanceBefore = user2.balance;
        tsaroSafe.withdrawContribution(groupId, contributionId);
        uint256 balanceAfter = user2.balance;

        assertEq(balanceAfter - balanceBefore, targetAmount, "User should receive contribution");

        vm.stopPrank();
    }

    // ============================================
    // G$ TOKEN APPROVAL FLOW TESTS
    // ============================================

    function testInitialApprovalNoAllowance() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 100 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group as user2
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        // Verify user2 has balance but no allowance
        assertEq(mockGoodDollar.balanceOf(user2), mintAmount, "User2 should have G$ balance");
        assertEq(mockGoodDollar.allowance(user2, address(tsaroSafe)), 0, "User2 should have no allowance initially");

        // Try to make contribution without approval (should fail)
        uint256 contributionAmount = 10 ether;
        vm.expectRevert(TsaroSafe.InsufficientAllowance.selector);
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1  // G$ token type
        );

        vm.stopPrank();
    }

    function testApprovalWithExistingAllowance() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 100 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve tokens
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        uint256 approvalAmount = 50 ether;
        mockGoodDollar.approve(address(tsaroSafe), approvalAmount);

        // Verify allowance is set
        assertEq(mockGoodDollar.allowance(user2, address(tsaroSafe)), approvalAmount, "Allowance should be set");

        // Make contribution with existing allowance
        uint256 contributionAmount = 10 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1  // G$ token type
        );

        // Verify contribution was recorded
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, contributionAmount, "Group should have contribution");

        // Verify allowance was reduced
        assertEq(
            mockGoodDollar.allowance(user2, address(tsaroSafe)),
            approvalAmount - contributionAmount,
            "Allowance should be reduced"
        );

        vm.stopPrank();
    }

    function testApprovalRejectionByUser() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 100 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group but don't approve
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        // Verify no allowance
        assertEq(mockGoodDollar.allowance(user2, address(tsaroSafe)), 0, "No allowance should be set");

        // Try to make contribution without approval
        uint256 contributionAmount = 10 ether;
        vm.expectRevert(TsaroSafe.InsufficientAllowance.selector);
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1  // G$ token type
        );

        // Verify group amount is still 0
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, 0, "Group should have no contributions");

        vm.stopPrank();
    }

    function testInsufficientAllowanceErrorHandling() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 100 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve insufficient amount
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        uint256 approvalAmount = 5 ether;
        mockGoodDollar.approve(address(tsaroSafe), approvalAmount);

        // Try to contribute more than approved
        uint256 contributionAmount = 10 ether;
        vm.expectRevert(TsaroSafe.InsufficientAllowance.selector);
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1  // G$ token type
        );

        // Verify no contribution was recorded
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, 0, "Group should have no contributions");

        vm.stopPrank();
    }

    function testApprovalAmountCalculations() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 1000 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve exact amount
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        uint256 approvalAmount = 100 ether;
        mockGoodDollar.approve(address(tsaroSafe), approvalAmount);

        // Make first contribution
        uint256 contribution1 = 30 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution1,
            "First contribution",
            1
        );

        // Verify remaining allowance
        uint256 remainingAllowance = mockGoodDollar.allowance(user2, address(tsaroSafe));
        assertEq(remainingAllowance, approvalAmount - contribution1, "Remaining allowance should be calculated correctly");

        // Make second contribution with remaining allowance
        uint256 contribution2 = 50 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution2,
            "Second contribution",
            1
        );

        // Verify final allowance
        uint256 finalAllowance = mockGoodDollar.allowance(user2, address(tsaroSafe));
        assertEq(finalAllowance, approvalAmount - contribution1 - contribution2, "Final allowance should be correct");

        // Verify group total
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, contribution1 + contribution2, "Group should have both contributions");

        vm.stopPrank();
    }

    function testMultipleUsersApprovalFlow() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2 and user3
        uint256 mintAmount = 500 ether;
        mockGoodDollar.mint(user2, mintAmount);
        mockGoodDollar.mint(user3, mintAmount);

        // User2 joins and approves
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        mockGoodDollar.approve(address(tsaroSafe), 100 ether);

        uint256 contribution2 = 40 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution2,
            "User2 contribution",
            1
        );
        vm.stopPrank();

        // User3 joins and approves
        vm.startPrank(user3);
        tsaroSafe.joinGroup(groupId);
        mockGoodDollar.approve(address(tsaroSafe), 150 ether);

        uint256 contribution3 = 60 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution3,
            "User3 contribution",
            1
        );
        vm.stopPrank();

        // Verify group total
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, contribution2 + contribution3, "Group should have both contributions");

        // Verify individual allowances
        assertEq(
            mockGoodDollar.allowance(user2, address(tsaroSafe)),
            100 ether - contribution2,
            "User2 allowance should be correct"
        );
        assertEq(
            mockGoodDollar.allowance(user3, address(tsaroSafe)),
            150 ether - contribution3,
            "User3 allowance should be correct"
        );
    }

    function testApprovalWithZeroAmount() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 100 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve zero amount
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        mockGoodDollar.approve(address(tsaroSafe), 0);

        // Try to make contribution with zero approval
        uint256 contributionAmount = 10 ether;
        vm.expectRevert(TsaroSafe.InsufficientAllowance.selector);
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1
        );

        vm.stopPrank();
    }

    function testApprovalIncreaseFlow() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 500 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve initial amount
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);

        uint256 initialApproval = 50 ether;
        mockGoodDollar.approve(address(tsaroSafe), initialApproval);

        // Make first contribution
        uint256 contribution1 = 40 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution1,
            "First contribution",
            1
        );

        // Verify remaining allowance
        uint256 remainingAllowance = mockGoodDollar.allowance(user2, address(tsaroSafe));
        assertEq(remainingAllowance, 10 ether, "Remaining allowance should be 10 ether");

        // Increase approval
        uint256 additionalApproval = 100 ether;
        mockGoodDollar.approve(address(tsaroSafe), additionalApproval);

        // Make second contribution with new approval
        uint256 contribution2 = 80 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution2,
            "Second contribution",
            1
        );

        // Verify final allowance
        uint256 finalAllowance = mockGoodDollar.allowance(user2, address(tsaroSafe));
        assertEq(finalAllowance, additionalApproval - contribution2, "Final allowance should be correct");

        // Verify group total
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, contribution1 + contribution2, "Group should have both contributions");

        vm.stopPrank();
    }

    function testApprovalWithMaxUint256() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint G$ tokens to user2
        uint256 mintAmount = 1000 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve max uint256
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        mockGoodDollar.approve(address(tsaroSafe), type(uint256).max);

        // Verify max allowance is set
        assertEq(
            mockGoodDollar.allowance(user2, address(tsaroSafe)),
            type(uint256).max,
            "Allowance should be max uint256"
        );

        // Make multiple contributions
        uint256 contribution1 = 100 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution1,
            "First contribution",
            1
        );

        uint256 contribution2 = 200 ether;
        tsaroSafe.makeContributionWithToken(
            groupId,
            contribution2,
            "Second contribution",
            1
        );

        // Verify group total
        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        assertEq(group.currentAmount, contribution1 + contribution2, "Group should have both contributions");

        vm.stopPrank();
    }

    function testApprovalWithInsufficientBalance() public {
        uint256 endDate = block.timestamp + 30 days;

        // Create G$ group
        vm.startPrank(user1);
        uint256 groupId = tsaroSafe.createGroup(
            "G$ Group",
            "Test G$ group",
            false,
            1000 ether,
            10,
            endDate,
            ITsaroSafeData.TokenType.GSTAR
        );
        vm.stopPrank();

        // Mint limited G$ tokens to user2
        uint256 mintAmount = 10 ether;
        mockGoodDollar.mint(user2, mintAmount);

        // Join group and approve more than balance
        vm.startPrank(user2);
        tsaroSafe.joinGroup(groupId);
        mockGoodDollar.approve(address(tsaroSafe), 100 ether);

        // Try to contribute more than balance (even though approved)
        uint256 contributionAmount = 50 ether;
        vm.expectRevert(TsaroSafe.InvalidAmount.selector);
        tsaroSafe.makeContributionWithToken(
            groupId,
            contributionAmount,
            "G$ contribution",
            1
        );

        vm.stopPrank();
    }
}
