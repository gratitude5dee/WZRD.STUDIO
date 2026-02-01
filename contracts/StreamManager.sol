// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { StreamReceiptNFT } from "./StreamReceiptNFT.sol";

/// @title StreamManager
/// @notice Manages ApeCoin streaming payouts (simple linear vesting stream).
contract StreamManager is Ownable {
    struct Stream {
        address payer;
        address recipient;
        address token;
        uint256 startTime;
        uint256 endTime;
        uint256 ratePerSecond;
        uint256 totalAmount;
        uint256 claimedAmount;
        bool cancelled;
    }

    uint256 public nextStreamId = 1;
    StreamReceiptNFT public receiptNFT;

    mapping(uint256 => Stream) public streams;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed payer,
        address indexed recipient,
        address token,
        uint256 startTime,
        uint256 endTime,
        uint256 ratePerSecond,
        uint256 totalAmount
    );
    event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount);
    event StreamCancelled(uint256 indexed streamId, address indexed recipient, uint256 refund);

    constructor(address receiptNftAddress) {
        receiptNFT = StreamReceiptNFT(receiptNftAddress);
    }

    function setReceiptNFT(address receiptNftAddress) external onlyOwner {
        receiptNFT = StreamReceiptNFT(receiptNftAddress);
    }

    /// @notice Create a new stream; funds are escrowed in this contract.
    function createStream(
        address recipient,
        address token,
        uint256 startTime,
        uint256 endTime,
        uint256 ratePerSecond
    ) external returns (uint256 streamId) {
        require(recipient != address(0), "recipient=0");
        require(token != address(0), "token=0");
        require(endTime > startTime, "invalid time range");
        require(ratePerSecond > 0, "rate=0");

        uint256 duration = endTime - startTime;
        uint256 totalAmount = duration * ratePerSecond;
        require(totalAmount > 0, "amount=0");

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            payer: msg.sender,
            recipient: recipient,
            token: token,
            startTime: startTime,
            endTime: endTime,
            ratePerSecond: ratePerSecond,
            totalAmount: totalAmount,
            claimedAmount: 0,
            cancelled: false
        });

        IERC20(token).transferFrom(msg.sender, address(this), totalAmount);

        receiptNFT.mintReceipt(recipient, streamId);

        emit StreamCreated(streamId, msg.sender, recipient, token, startTime, endTime, ratePerSecond, totalAmount);
    }

    function claim(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(!stream.cancelled, "cancelled");
        require(stream.recipient == msg.sender, "not recipient");

        uint256 claimable = _claimable(stream);
        require(claimable > 0, "nothing to claim");

        stream.claimedAmount += claimable;
        IERC20(stream.token).transfer(stream.recipient, claimable);

        emit StreamClaimed(streamId, stream.recipient, claimable);
    }

    function cancel(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(!stream.cancelled, "cancelled");
        require(stream.payer == msg.sender, "not payer");

        uint256 claimable = _claimable(stream);
        if (claimable > 0) {
            stream.claimedAmount += claimable;
            IERC20(stream.token).transfer(stream.recipient, claimable);
            emit StreamClaimed(streamId, stream.recipient, claimable);
        }

        uint256 remaining = stream.totalAmount - stream.claimedAmount;
        stream.cancelled = true;

        if (remaining > 0) {
            IERC20(stream.token).transfer(stream.payer, remaining);
        }

        emit StreamCancelled(streamId, stream.recipient, remaining);
    }

    function claimable(uint256 streamId) external view returns (uint256) {
        return _claimable(streams[streamId]);
    }

    function _claimable(Stream storage stream) internal view returns (uint256) {
        if (block.timestamp <= stream.startTime) return 0;

        uint256 effectiveEnd = block.timestamp < stream.endTime ? block.timestamp : stream.endTime;
        uint256 elapsed = effectiveEnd - stream.startTime;
        uint256 totalEarned = elapsed * stream.ratePerSecond;

        if (totalEarned > stream.totalAmount) {
            totalEarned = stream.totalAmount;
        }

        if (totalEarned <= stream.claimedAmount) return 0;
        return totalEarned - stream.claimedAmount;
    }
}
