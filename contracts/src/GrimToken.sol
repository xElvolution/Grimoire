// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GrimToken ($GRIM)
/// @notice The Grimoire economy token — a minimal, self-contained ERC-20 used for
///         staking to publish skills, paying for skill use, and curation rewards.
///         Dependency-free for auditability; production would use OpenZeppelin.
contract GrimToken {
    string public constant name = "Grimoire";
    string public constant symbol = "GRIM";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    address public minter;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MinterChanged(address indexed from, address indexed to);

    error NotMinter();
    error InsufficientBalance();
    error InsufficientAllowance();

    constructor(uint256 initialSupply) {
        minter = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < value) revert InsufficientAllowance();
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    /// @notice Mint new tokens (minter only — e.g. emissions for curation rewards).
    function mint(address to, uint256 value) external {
        if (msg.sender != minter) revert NotMinter();
        _mint(to, value);
    }

    function setMinter(address newMinter) external {
        if (msg.sender != minter) revert NotMinter();
        emit MinterChanged(minter, newMinter);
        minter = newMinter;
    }

    function _transfer(address from, address to, uint256 value) internal {
        uint256 bal = balanceOf[from];
        if (bal < value) revert InsufficientBalance();
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        unchecked {
            balanceOf[to] += value;
        }
        emit Transfer(address(0), to, value);
    }
}
