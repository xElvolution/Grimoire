export const SKILL_REGISTRY_ABI = [
  "function registerSkill(bytes32 rootHash, uint96 royaltyPerUse)",
  "function useSkill(bytes32 rootHash) payable",
  "function getSkill(bytes32 rootHash) view returns (address creator, uint96 royaltyPerUse, uint64 uses, uint256 earnings)",
  "function exists(bytes32 rootHash) view returns (bool)",
  "event SkillRegistered(bytes32 indexed rootHash, address indexed creator, uint96 royaltyPerUse)",
  "event SkillUsed(bytes32 indexed rootHash, address indexed user, address indexed creator, uint256 amount)",
] as const;

export const ROYALTY_VAULT_ABI = [
  "function deposit(address creator) payable",
  "function withdraw()",
  "function owed(address creator) view returns (uint256)",
  "function totalDistributed() view returns (uint256)",
] as const;

export const MEMORY_REGISTRY_ABI = [
  "function store(bytes32 root, string label) returns (uint256 id)",
  "function grant(uint256 id, address grantee)",
  "function revoke(uint256 id, address grantee)",
  "function canRead(uint256 id, address reader) view returns (bool)",
  "function getMemory(uint256 id) view returns (address owner, bytes32 root, string label, uint64 createdAt)",
  "function nextId() view returns (uint256)",
  "event MemoryStored(uint256 indexed id, address indexed owner, bytes32 root, string label)",
] as const;

export const SKILL_MARKETPLACE_ABI = [
  "function claim(bytes32 skill)",
  "function list(bytes32 skill, uint256 price)",
  "function delist(bytes32 skill)",
  "function buy(bytes32 skill) payable",
  "function listings(bytes32 skill) view returns (address seller, uint256 price, bool active)",
  "function ownerOf(bytes32 skill) view returns (address)",
] as const;

export const AGENT_REGISTRY_ABI = [
  "function mintAgent(bytes32 metadata, string specialty, uint256 spawnedBy) returns (uint256 id)",
  "function getAgent(uint256 id) view returns (address owner, bytes32 metadata, string specialty, uint64 reputation, uint256 spawnedBy)",
  "function nextId() view returns (uint256)",
  "event AgentMinted(uint256 indexed id, address indexed owner, string specialty, uint256 spawnedBy)",
] as const;

export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function mint(address to, uint256 value)",
  "function transfer(address to, uint256 value) returns (bool)",
] as const;
