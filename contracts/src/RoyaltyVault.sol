// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title RoyaltyVault
/// @notice Pull-payment accumulation of skill royalties. Payers deposit royalties
///         crediting a creator; creators withdraw their balance when they like.
///         Safer than push payments for high-frequency, many-recipient settlement.
contract RoyaltyVault {
    mapping(address => uint256) public owed;
    uint256 public totalDistributed;

    event RoyaltyDeposited(address indexed creator, address indexed payer, uint256 amount);
    event RoyaltyWithdrawn(address indexed creator, uint256 amount);

    error NothingOwed();
    error TransferFailed();

    /// @notice Deposit a royalty crediting `creator` (the creator withdraws later).
    function deposit(address creator) external payable {
        owed[creator] += msg.value;
        totalDistributed += msg.value;
        emit RoyaltyDeposited(creator, msg.sender, msg.value);
    }

    /// @notice Withdraw all royalties owed to the caller.
    function withdraw() external {
        uint256 amount = owed[msg.sender];
        if (amount == 0) revert NothingOwed();
        owed[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit RoyaltyWithdrawn(msg.sender, amount);
    }
}
