//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract USDCToken {
    address public owner;
    string public name;
    string public symbol;
    uint256 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed owner, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed recipient, uint256 amount);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);

        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(!(_spender == address(0)));

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, 'Insufficient allowance');

        _transfer(_from, _to, _value);

        allowance[_from][msg.sender] -= _value;

        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(!(_from == address(0)));
        require(!(_to == address(0)));

        require(balanceOf[_from] >= _value, 'Insufficient balance');

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
    }

    function mint(address _recipient, uint256 _amount) public onlyOwner returns (bool success) {
        require(!(_recipient == address(0)));

        totalSupply += _amount;
        balanceOf[_recipient] += _amount;

        emit Mint(_recipient, _amount);
        return true;
    }
}
