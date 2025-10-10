// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract FileStorage {
  
    struct Access {
        address user;
        bool access;
    }

    mapping(address => string[]) private value;
    mapping(address => mapping(address => bool)) private ownership;
    mapping(address => Access[]) private accessList;
    mapping(address => mapping(address => bool)) private previousData;

    function uploadFile(string memory url) external {
        value[msg.sender].push(url);
    }

    function allow(address user) external {
        ownership[msg.sender][user] = true; 
        if (previousData[msg.sender][user]) {
            for (uint i = 0; i < accessList[msg.sender].length; i++) {
                if (accessList[msg.sender][i].user == user) {
                    accessList[msg.sender][i].access = true;
                }
            }
        } else {
            accessList[msg.sender].push(Access(user, true));  
            previousData[msg.sender][user] = true;  
        }
    }

    function display(address _user) external view returns(string[] memory) {
        require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");
        return value[_user];
    }

    function getMyFiles() external view returns (string[] memory) {
        return value[msg.sender];
    }

    function shareAccess() public view returns(Access[] memory) {
        return accessList[msg.sender];
    }
}
