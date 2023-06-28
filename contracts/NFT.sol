// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = '.json';
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public allowMintingOn;
    uint256 public maxMint;
    bool public isPaused = false;
    mapping(address => bool) public whitelist;

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI,
        uint256 _maxMint
    ) ERC721 (_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
        maxMint = _maxMint;
    }

    function mint(uint256 _mintAmount) public payable {
        require(!isPaused, 'Minting is paused');

        require(block.timestamp >= allowMintingOn, 'Minting not yet allowed');

        require(whitelist[msg.sender], 'Address not whitelisted');

        require(_mintAmount > 0, 'Must mint at least 1 NFT');

        require(_mintAmount <= maxMint, 'Cannot mint that many NFTs');

        require(msg.value >= cost * _mintAmount, 'Insufficient ether sent');

        uint256 supply = totalSupply();

        require(supply + _mintAmount <= maxSupply, 'Cannot mint more NFTs than total available');

        for(uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        emit Mint(_mintAmount, msg.sender);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'Token does not exist');
        return string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension));
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokenIds;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}('');
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        require(_newCost > 0, 'New cost must be above 0');
        cost = _newCost;
    }

    function pauseMint(bool _isPaused) public onlyOwner {
        isPaused = _isPaused;
    }
}
