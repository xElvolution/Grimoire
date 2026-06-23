// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SkillRegistry
/// @notice On-chain ownership and royalty settlement for Grimoire skills.
///         A skill is identified by its 0G Storage root hash. Verified usage is
///         proven off-chain by 0G Compute's TEE; this contract settles the royalty
///         payment to the skill's creator on-chain and keeps an auditable tally.
contract SkillRegistry {
    struct Skill {
        address creator; // receives royalties
        uint96 royaltyPerUse; // in wei (0G)
        uint64 uses; // verified uses settled on-chain
        uint256 earnings; // total wei paid to the creator
        bool exists;
    }

    /// @dev 0G Storage root hash => skill
    mapping(bytes32 => Skill) private _skills;

    event SkillRegistered(bytes32 indexed rootHash, address indexed creator, uint96 royaltyPerUse);
    event SkillUsed(bytes32 indexed rootHash, address indexed user, address indexed creator, uint256 amount);
    event RoyaltyUpdated(bytes32 indexed rootHash, uint96 royaltyPerUse);

    error AlreadyRegistered();
    error UnknownSkill();
    error NotCreator();
    error InsufficientRoyalty();
    error TransferFailed();

    /// @notice Register a newly minted skill (one call per 0G root hash).
    function registerSkill(bytes32 rootHash, uint96 royaltyPerUse) external {
        if (_skills[rootHash].exists) revert AlreadyRegistered();
        _skills[rootHash] = Skill({
            creator: msg.sender,
            royaltyPerUse: royaltyPerUse,
            uses: 0,
            earnings: 0,
            exists: true
        });
        emit SkillRegistered(rootHash, msg.sender, royaltyPerUse);
    }

    /// @notice Use a skill, paying its royalty to the creator. Send at least
    ///         `royaltyPerUse`; any excess is forwarded to the creator too.
    function useSkill(bytes32 rootHash) external payable {
        Skill storage s = _skills[rootHash];
        if (!s.exists) revert UnknownSkill();
        if (msg.value < s.royaltyPerUse) revert InsufficientRoyalty();

        unchecked {
            s.uses += 1;
            s.earnings += msg.value;
        }

        (bool ok, ) = s.creator.call{value: msg.value}("");
        if (!ok) revert TransferFailed();

        emit SkillUsed(rootHash, msg.sender, s.creator, msg.value);
    }

    /// @notice Creator may adjust the per-use royalty.
    function setRoyalty(bytes32 rootHash, uint96 royaltyPerUse) external {
        Skill storage s = _skills[rootHash];
        if (!s.exists) revert UnknownSkill();
        if (s.creator != msg.sender) revert NotCreator();
        s.royaltyPerUse = royaltyPerUse;
        emit RoyaltyUpdated(rootHash, royaltyPerUse);
    }

    function getSkill(bytes32 rootHash)
        external
        view
        returns (address creator, uint96 royaltyPerUse, uint64 uses, uint256 earnings)
    {
        Skill memory s = _skills[rootHash];
        if (!s.exists) revert UnknownSkill();
        return (s.creator, s.royaltyPerUse, s.uses, s.earnings);
    }

    function exists(bytes32 rootHash) external view returns (bool) {
        return _skills[rootHash].exists;
    }
}
