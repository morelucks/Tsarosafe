// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ITsaroSafeData.sol";

/**
 * @title TsaroSafe
 * @notice Main TsaroSafe contract for decentralized savings groups
 * @dev Implements group creation, management, and member operations
 */
contract TsaroSafe is ITsaroSafeData {
    // State variables
    uint256 public nextGroupId = 1;
    
    // Mappings
    mapping(uint256 => Group) public groups;
    mapping(uint256 => mapping(address => Member)) public groupMembers;
    mapping(uint256 => address[]) public groupMemberList;
    mapping(address => uint256[]) public userGroups;
    
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
        groupMembers[groupId][msg.sender] = Member({
            user: msg.sender,
            contribution: 0,
            lastContribution: 0,
            isActive: true,
            joinedAt: block.timestamp
        });
        
        groupMemberList[groupId].push(msg.sender);
        userGroups[msg.sender].push(groupId);
        
        emit GroupCreated(
            groupId, 
            msg.sender, 
            _name, 
            _isPrivate, 
            _targetAmount, 
            _memberLimit, 
            _endDate
        );
        emit MemberJoined(groupId, msg.sender);
        
        return groupId;
    }
    
    /**
     * @notice Update group metadata (only by creator)
     * @param _groupId Group ID
     * @param _name New group name
     * @param _description New group description
     */
    function updateGroupMetadata(
        uint256 _groupId,
        string memory _name,
        string memory _description
    ) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
        require(bytes(_name).length > 0, "Group name cannot be empty");
        require(bytes(_name).length <= 100, "Group name too long");
        require(bytes(_description).length <= 500, "Description too long");
        
        groups[_groupId].name = _name;
        groups[_groupId].description = _description;
        
        emit GroupUpdated(_groupId, "metadata", "updated");
    }
    
    /**
     * @notice Update group target amount (only by creator)
     * @param _groupId Group ID
     * @param _newTarget New target amount
     */
    function updateGroupTarget(
        uint256 _groupId, 
        uint256 _newTarget
    ) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
        require(_newTarget > 0, "Target must be greater than 0");
        require(_newTarget > groups[_groupId].currentAmount, "New target must be greater than current amount");
        
        groups[_groupId].targetAmount = _newTarget;
        emit GroupUpdated(_groupId, "target", "updated");
    }
    
    /**
     * @notice Update group member limit (only by creator)
     * @param _groupId Group ID
     * @param _newLimit New member limit
     */
    function updateMemberLimit(
        uint256 _groupId, 
        uint256 _newLimit
    ) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
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
    function updateEndDate(
        uint256 _groupId, 
        uint256 _newEndDate
    ) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
        require(_newEndDate > block.timestamp, "End date must be in the future");
        require(_newEndDate <= block.timestamp + 365 days, "End date cannot exceed 1 year");
        
        groups[_groupId].endDate = _newEndDate;
        emit GroupUpdated(_groupId, "endDate", "updated");
    }
    
    /**
     * @notice Toggle group privacy (only by creator)
     * @param _groupId Group ID
     */
    function toggleGroupPrivacy(uint256 _groupId) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
        groups[_groupId].isPrivate = !groups[_groupId].isPrivate;
        emit GroupUpdated(_groupId, "privacy", groups[_groupId].isPrivate ? "private" : "public");
    }
    
    /**
     * @notice Deactivate group (only by creator)
     * @param _groupId Group ID
     */
    function deactivateGroup(uint256 _groupId) external groupExists(_groupId) onlyGroupCreator(_groupId) groupActive(_groupId) {
        groups[_groupId].isActive = false;
        emit GroupUpdated(_groupId, "status", "deactivated");
    }
    
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
    function getMemberInfo(uint256 _groupId, address _member) external view groupExists(_groupId) returns (Member memory) {
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
    function getGroupStats(uint256 _groupId) external view groupExists(_groupId) returns (
        uint256 memberCount,
        uint256 currentAmount,
        uint256 targetAmount,
        uint256 progressPercentage,
        bool isActive,
        bool isCompleted
    ) {
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
}