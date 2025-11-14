// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TsaroSafe} from "../src/core/TsaroSafe.sol";

/**
 * @title TsaroSafeTest
 * @notice Test suite for TsaroSafe contract
 */
contract TsaroSafeTest is Test {
    TsaroSafe public tsaroSafe;
    address public user1;
    address public user2;
    address public user3;

    event GroupCreated(
        uint256 indexed groupId,
        address indexed creator,
        string name,
        uint256 targetAmount,
        bool isPrivate
    );
    
    event MemberJoined(
        uint256 indexed groupId,
        address indexed member
    );
    
    event ContributionMade(
        uint256 indexed groupId,
        address indexed member,
        uint256 amount
    );
    
    event GroupCompleted(
        uint256 indexed groupId,
        uint256 totalAmount
    );
    
    event UserVerified(
        address indexed user,
        uint256 timestamp
    );

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contract
        tsaroSafe = new TsaroSafe();
    }

    function testContractDeployment() public {
        assertTrue(address(tsaroSafe) != address(0));
        
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TsaroSafe} from "../src/core/TsaroSafe.sol";
import {ITsaroSafeData} from "../src/interfaces/ITsaroSafeData.sol";

/**
 * @title TsaroSafeTest
 * @notice Comprehensive test suite for TsaroSafe contract - createGroup() function
 */
contract TsaroSafeTest is Test {
    TsaroSafe public tsaroSafe;
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
    
    event GoalSet(
        uint256 indexed groupId,
        uint256 targetAmount,
        uint256 deadline,
        uint256 createdAt
    );

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contract
        tsaroSafe = new TsaroSafe();
    }

    function testContractDeployment() public {
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
        uint256 groupId = tsaroSafe.createGroup(
            groupName,
            description,
            isPrivate,
            targetAmount,
            memberLimit,
            endDate
        );

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
        uint256 groupId = tsaroSafe.createGroup(
            groupName,
            description,
            isPrivate,
            targetAmount,
            memberLimit,
            endDate
        );

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

        vm.stopPrank();
    }

    function testCreateGroupAddsCreatorAsFirstMember() public {
        // Setup
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        // Execute
        uint256 groupId = tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            10,
            endDate
        );

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
        uint256 groupId = tsaroSafe.createGroup(
            "Goal Test Group",
            "Testing goal initialization",
            false,
            targetAmount,
            15,
            endDate
        );

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
        uint256 groupId1 = tsaroSafe.createGroup(
            "First Group",
            "Description 1",
            false,
            1000 ether,
            10,
            endDate
        );

        // Execute - create second group
        uint256 groupId2 = tsaroSafe.createGroup(
            "Second Group",
            "Description 2",
            true,
            2000 ether,
            5,
            endDate
        );

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
        uint256 groupId = tsaroSafe.createGroup(
            groupName,
            "Testing events",
            false,
            targetAmount,
            memberLimit,
            endDate
        );

        // Get logs
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Assertions - should have 3 events: GroupCreated, MemberJoined, GoalSet
        assertEq(logs.length, 3, "Should emit exactly 3 events");

        // Verify GroupCreated event
        assertEq(logs[0].topics[0], keccak256("GroupCreated(uint256,address,string,bool,uint256,uint256,uint256)"), "First event should be GroupCreated");
        assertEq(uint256(logs[0].topics[1]), groupId, "GroupCreated groupId should match");
        assertEq(address(uint160(uint256(logs[0].topics[2]))), user1, "GroupCreated creator should match");

        // Verify MemberJoined event
        assertEq(logs[1].topics[0], keccak256("MemberJoined(uint256,address)"), "Second event should be MemberJoined");
        assertEq(uint256(logs[1].topics[1]), groupId, "MemberJoined groupId should match");
        assertEq(address(uint160(uint256(logs[1].topics[2]))), user1, "MemberJoined member should match");

        // Verify GoalSet event
        assertEq(logs[2].topics[0], keccak256("GoalSet(uint256,uint256,uint256,uint256)"), "Third event should be GoalSet");
        assertEq(uint256(logs[2].topics[1]), groupId, "GoalSet groupId should match");

        vm.stopPrank();
    }

    // ============================================
    // VALIDATION & EDGE CASE TESTS
    // ============================================

    function testCreateGroupRevertsWithEmptyName() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert("Group name cannot be empty");
        tsaroSafe.createGroup(
            "",
            "Description",
            false,
            1000 ether,
            10,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithNameTooLong() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;
        
        // Create a name that's 101 characters long
        string memory longName = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        vm.expectRevert("Group name too long");
        tsaroSafe.createGroup(
            longName,
            "Description",
            false,
            1000 ether,
            10,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithDescriptionTooLong() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;
        
        // Create a description that's 501 characters long
        string memory longDescription = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        vm.expectRevert("Description too long");
        tsaroSafe.createGroup(
            "Test Group",
            longDescription,
            false,
            1000 ether,
            10,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithZeroTargetAmount() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert("Target amount must be greater than 0");
        tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            0,
            10,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithZeroMemberLimit() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert("Member limit must be greater than 0");
        tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            0,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithMemberLimitExceedingMax() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        vm.expectRevert("Member limit cannot exceed 100");
        tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            101,
            endDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithPastEndDate() public {
        vm.startPrank(user1);
        uint256 pastDate = block.timestamp - 1 days;

        vm.expectRevert("End date must be in the future");
        tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            10,
            pastDate
        );

        vm.stopPrank();
    }

    function testCreateGroupRevertsWithEndDateExceedingOneYear() public {
        vm.startPrank(user1);
        uint256 farFutureDate = block.timestamp + 366 days;

        vm.expectRevert("End date cannot exceed 1 year");
        tsaroSafe.createGroup(
            "Test Group",
            "Description",
            false,
            1000 ether,
            10,
            farFutureDate
        );

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
            endDate
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
        string memory maxName = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        
        // Create a 500-character description
        string memory maxDescription = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        
        uint256 endDate = block.timestamp + 365 days; // Maximum 1 year

        uint256 groupId = tsaroSafe.createGroup(
            maxName,
            maxDescription,
            true,
            type(uint256).max, // Maximum target amount
            100, // Maximum member limit
            endDate
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
        uint256 groupId1 = tsaroSafe.createGroup(
            "User1 Group",
            "Description",
            false,
            1000 ether,
            10,
            endDate
        );
        vm.stopPrank();

        // User2 creates a group
        vm.startPrank(user2);
        uint256 groupId2 = tsaroSafe.createGroup(
            "User2 Group",
            "Description",
            true,
            2000 ether,
            5,
            endDate
        );
        vm.stopPrank();

        // User3 creates a group
        vm.startPrank(user3);
        uint256 groupId3 = tsaroSafe.createGroup(
            "User3 Group",
            "Description",
            false,
            3000 ether,
            15,
            endDate
        );
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
            endDate
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
            endDate
        );

        ITsaroSafeData.Group memory group = tsaroSafe.getGroup(groupId);
        
        assertTrue(group.isPrivate, "Group should be private");

        vm.stopPrank();
    }

    function testCreateGroupIncrementsGroupIdCorrectly() public {
        vm.startPrank(user1);
        uint256 endDate = block.timestamp + 30 days;

        assertEq(tsaroSafe.nextGroupId(), 1, "Initial nextGroupId should be 1");

        uint256 groupId1 = tsaroSafe.createGroup("Group 1", "Desc", false, 1000 ether, 10, endDate);
        assertEq(groupId1, 1, "First group ID should be 1");
        assertEq(tsaroSafe.nextGroupId(), 2, "nextGroupId should be 2");

        uint256 groupId2 = tsaroSafe.createGroup("Group 2", "Desc", false, 1000 ether, 10, endDate);
        assertEq(groupId2, 2, "Second group ID should be 2");
        assertEq(tsaroSafe.nextGroupId(), 3, "nextGroupId should be 3");

        uint256 groupId3 = tsaroSafe.createGroup("Group 3", "Desc", false, 1000 ether, 10, endDate);
        assertEq(groupId3, 3, "Third group ID should be 3");
        assertEq(tsaroSafe.nextGroupId(), 4, "nextGroupId should be 4");

        vm.stopPrank();
    }
}
