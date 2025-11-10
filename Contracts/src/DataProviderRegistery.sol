// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DataProviderRegistry
 * @dev Registry for data providers in the NUMA marketplace
 */
contract DataProviderRegistry {
    struct DataProvider {
        string name;
        string description;
        string endpoint;
        address owner;
        uint256 stakeAmount;
        uint256 reputationScore;
        bool isActive;
        uint256[] apiIds;
    }
    
    struct APIEndpoint {
        string name;
        string category;
        uint256 pricePerCall; // in wei
        uint256 rateLimit;
        bool isActive;
    }
    
    mapping(address => DataProvider) public providers;
    mapping(uint256 => APIEndpoint) public apis;
    mapping(address => uint256) public providerStakes;
    
    uint256 public nextApiId = 1;
    uint256 public minStakeAmount = 1000 * 10 ** 18; // 1000 NUMA tokens
    
    event ProviderRegistered(address indexed provider, string name);
    event APIAdded(uint256 indexed apiId, address indexed provider, string name);
    event ProviderStaked(address indexed provider, uint256 amount);
    
    function registerProvider(
        string memory _name,
        string memory _description,
        string memory _endpoint
    ) external {
        require(providers[msg.sender].owner == address(0), "Provider already registered");
        
        providers[msg.sender] = DataProvider({
            name: _name,
            description: _description,
            endpoint: _endpoint,
            owner: msg.sender,
            stakeAmount: 0,
            reputationScore: 100, // Initial reputation
            isActive: false, // Inactive until staked
            apiIds: new uint256[](0)
        });
        
        emit ProviderRegistered(msg.sender, _name);
    }
    
    function stakeAndActivate() external {
        require(providers[msg.sender].owner != address(0), "Provider not registered");
        require(!providers[msg.sender].isActive, "Provider already active");
        
        NUMAToken numaToken = NUMAToken(tokenAddress);
        require(numaToken.transferFrom(msg.sender, address(this), minStakeAmount), "Stake transfer failed");
        
        providers[msg.sender].stakeAmount = minStakeAmount;
        providers[msg.sender].isActive = true;
        providerStakes[msg.sender] = minStakeAmount;
        
        emit ProviderStaked(msg.sender, minStakeAmount);
    }
    
    function addAPIEndpoint(
        string memory _name,
        string memory _category,
        uint256 _pricePerCall,
        uint256 _rateLimit
    ) external returns (uint256) {
        require(providers[msg.sender].isActive, "Provider not active");
        
        uint256 apiId = nextApiId++;
        apis[apiId] = APIEndpoint({
            name: _name,
            category: _category,
            pricePerCall: _pricePerCall,
            rateLimit: _rateLimit,
            isActive: true
        });
        
        providers[msg.sender].apiIds.push(apiId);
        emit APIAdded(apiId, msg.sender, _name);
        
        return apiId;
    }
}