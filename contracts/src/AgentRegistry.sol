// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentRegistry
/// @notice A minimal ERC-7857-style "Agentic ID" registry for Grimoire.
///         Each agent is an on-chain identity owned by an address, with a metadata
///         pointer (a 0G Storage root hash holding the agent's memory/skills), a
///         specialty, and a reputation score. Agents can be *spawned by* other agents
///         (recording lineage) and transferred to new owners.
contract AgentRegistry {
    struct Agent {
        address owner;
        bytes32 metadata; // 0G Storage root hash of the agent's mind (memory + skills)
        string specialty;
        uint64 reputation; // 0..100
        uint256 spawnedBy; // tokenId of the parent agent (0 = genesis)
        bool exists;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Agent) private _agents;
    mapping(address => uint256) public balanceOf;

    event AgentMinted(uint256 indexed id, address indexed owner, string specialty, uint256 spawnedBy);
    event AgentTransferred(uint256 indexed id, address indexed from, address indexed to);
    event MetadataUpdated(uint256 indexed id, bytes32 metadata);
    event ReputationUpdated(uint256 indexed id, uint64 reputation);

    error UnknownAgent();
    error NotOwner();

    /// @notice Mint a new agent identity.
    /// @param metadata 0G Storage root hash of the agent's mind.
    /// @param specialty The domain this agent is expert in.
    /// @param spawnedBy tokenId of the agent that minted this one (0 for genesis).
    function mintAgent(bytes32 metadata, string calldata specialty, uint256 spawnedBy)
        external
        returns (uint256 id)
    {
        id = nextId++;
        _agents[id] = Agent({
            owner: msg.sender,
            metadata: metadata,
            specialty: specialty,
            reputation: 70,
            spawnedBy: spawnedBy,
            exists: true
        });
        balanceOf[msg.sender] += 1;
        emit AgentMinted(id, msg.sender, specialty, spawnedBy);
    }

    function transfer(uint256 id, address to) external {
        Agent storage a = _agents[id];
        if (!a.exists) revert UnknownAgent();
        if (a.owner != msg.sender) revert NotOwner();
        balanceOf[msg.sender] -= 1;
        balanceOf[to] += 1;
        a.owner = to;
        emit AgentTransferred(id, msg.sender, to);
    }

    /// @notice Update the agent's mind pointer (e.g. after learning a new skill).
    function setMetadata(uint256 id, bytes32 metadata) external {
        Agent storage a = _agents[id];
        if (!a.exists) revert UnknownAgent();
        if (a.owner != msg.sender) revert NotOwner();
        a.metadata = metadata;
        emit MetadataUpdated(id, metadata);
    }

    /// @notice Reputation is set by the owner (in production: by a verified-usage oracle).
    function setReputation(uint256 id, uint64 reputation) external {
        Agent storage a = _agents[id];
        if (!a.exists) revert UnknownAgent();
        if (a.owner != msg.sender) revert NotOwner();
        a.reputation = reputation;
        emit ReputationUpdated(id, reputation);
    }

    function ownerOf(uint256 id) external view returns (address) {
        if (!_agents[id].exists) revert UnknownAgent();
        return _agents[id].owner;
    }

    function getAgent(uint256 id)
        external
        view
        returns (address owner, bytes32 metadata, string memory specialty, uint64 reputation, uint256 spawnedBy)
    {
        Agent memory a = _agents[id];
        if (!a.exists) revert UnknownAgent();
        return (a.owner, a.metadata, a.specialty, a.reputation, a.spawnedBy);
    }
}
