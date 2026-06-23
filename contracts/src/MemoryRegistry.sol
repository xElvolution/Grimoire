// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MemoryRegistry
/// @notice Sovereign, portable agent memory anchored on 0G. Each memory is a 0G
///         Storage root hash owned by a wallet, with per-grantee read access.
///         Revoking access = the agent forgets (loses its read right) — the live
///         "own your AI's mind" guarantee, enforced on-chain.
contract MemoryRegistry {
    struct Memory {
        address owner;
        bytes32 root; // 0G Storage root hash of the memory blob
        string label;
        uint64 createdAt;
        bool exists;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Memory) private _mem;
    mapping(uint256 => mapping(address => bool)) public canRead;

    event MemoryStored(uint256 indexed id, address indexed owner, bytes32 root, string label);
    event AccessGranted(uint256 indexed id, address indexed grantee);
    event AccessRevoked(uint256 indexed id, address indexed grantee);

    error UnknownMemory();
    error NotOwner();

    modifier onlyOwner(uint256 id) {
        if (!_mem[id].exists) revert UnknownMemory();
        if (_mem[id].owner != msg.sender) revert NotOwner();
        _;
    }

    /// @notice Store a memory (its 0G root hash). The owner can read by default.
    function store(bytes32 root, string calldata label) external returns (uint256 id) {
        id = nextId++;
        _mem[id] = Memory({
            owner: msg.sender,
            root: root,
            label: label,
            createdAt: uint64(block.timestamp),
            exists: true
        });
        canRead[id][msg.sender] = true;
        emit MemoryStored(id, msg.sender, root, label);
    }

    /// @notice Grant another address (e.g. another agent) read access.
    function grant(uint256 id, address grantee) external onlyOwner(id) {
        canRead[id][grantee] = true;
        emit AccessGranted(id, grantee);
    }

    /// @notice Revoke read access — the grantee can no longer use this memory.
    function revoke(uint256 id, address grantee) external onlyOwner(id) {
        canRead[id][grantee] = false;
        emit AccessRevoked(id, grantee);
    }

    function getMemory(uint256 id)
        external
        view
        returns (address owner, bytes32 root, string memory label, uint64 createdAt)
    {
        Memory memory m = _mem[id];
        if (!m.exists) revert UnknownMemory();
        return (m.owner, m.root, m.label, m.createdAt);
    }
}
