// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SkillMarketplace
/// @notice List and buy ownership of Grimoire skills (identified by their 0G Storage
///         root hash). Ownership = the royalty recipient. Settlement pays the seller
///         directly; the contract never custodies funds.
contract SkillMarketplace {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(bytes32 => Listing) public listings; // skill root hash => listing
    mapping(bytes32 => address) public ownerOf; // current owner / royalty recipient

    event Claimed(bytes32 indexed skill, address indexed owner);
    event Listed(bytes32 indexed skill, address indexed seller, uint256 price);
    event Delisted(bytes32 indexed skill);
    event Sold(bytes32 indexed skill, address indexed from, address indexed to, uint256 price);

    error NotOwner();
    error NotActive();
    error WrongPrice();
    error AlreadyClaimed();
    error TransferFailed();

    /// @notice First-time ownership claim (e.g. by the skill's creator).
    function claim(bytes32 skill) external {
        if (ownerOf[skill] != address(0)) revert AlreadyClaimed();
        ownerOf[skill] = msg.sender;
        emit Claimed(skill, msg.sender);
    }

    function list(bytes32 skill, uint256 price) external {
        if (ownerOf[skill] != msg.sender) revert NotOwner();
        listings[skill] = Listing({seller: msg.sender, price: price, active: true});
        emit Listed(skill, msg.sender, price);
    }

    function delist(bytes32 skill) external {
        if (listings[skill].seller != msg.sender) revert NotOwner();
        listings[skill].active = false;
        emit Delisted(skill);
    }

    function buy(bytes32 skill) external payable {
        Listing memory l = listings[skill];
        if (!l.active) revert NotActive();
        if (msg.value != l.price) revert WrongPrice();
        listings[skill].active = false;
        ownerOf[skill] = msg.sender;
        (bool ok, ) = l.seller.call{value: msg.value}("");
        if (!ok) revert TransferFailed();
        emit Sold(skill, l.seller, msg.sender, msg.value);
    }
}
