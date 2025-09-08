// Simple contract that stores events emitted by server as logs
// For testing: Emit an event/smart contracts to log critical events
pragma solidity ^0.8.0;

contract EventLogger {
    event LogEvent(address indexed sender, string userId, string action, uint256 ts);

    function logEvent(string memory userId, string memory action) external {
        emit LogEvent(msg.sender, userId, action, block.timestamp);
    }
}
