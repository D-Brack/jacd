// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import './JACDToken.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract JACD {
    JACDToken public jacdToken;
    IERC20 public usdcToken;

    IERC721 public jetpacks;
    IERC721 public hoverboards;
    IERC721 public avas;

    uint256 public jacdSupply;
    uint256 public usdcBalance;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    struct Proposal {
        uint256 index;
        address recipient;
        uint256 amount;
        string description;
    }

    event Deposit(
        address depositor,
        uint256 amount,
        uint256 timestamp
    );

    event Propose(
        uint256 index,
        address recipient,
        uint256 amount,
        string description,
        address creator,
        uint256 timestamp
    );

    modifier onlyHolders {
        require(jetpacks.balanceOf(msg.sender) > 0 ||
            hoverboards.balanceOf(msg.sender) > 0 ||
            avas.balanceOf(msg.sender) > 0,
            'JACD: not a collection holder');
        _;
    }

    constructor(
        JACDToken _jacdToken,
        IERC20 _usdcToken,
        IERC721 _jetpacks,
        IERC721 _hoverboards,
        IERC721 _avas
    )
    {
        jacdToken = _jacdToken;
        usdcToken = _usdcToken;
        jetpacks = _jetpacks;
        hoverboards = _hoverboards;
        avas = _avas;
    }

    receive() external payable {}

    // Receive usdc deposits & Distribute tokens
    function receiveDeposit(uint256 _amount) public {
        require(_amount > 0, 'JACD: deposit amount of 0');
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            'JACD: USDC transfer failed'
        );

        usdcBalance += _amount;

        distributeTokens(msg.sender, _amount);

        emit Deposit(msg.sender, _amount, block.timestamp);
    }

    function distributeTokens(address _depositer, uint256 _amount) private {
        require(
            jacdToken.mint(_depositer, _amount),
            'JACD: distribution of JACD tokens failed'
        );

        jacdSupply += _amount;
    }

    // Receive proposals
    function createProposal(
        address _recipient,
        uint256 _amount,
        string memory _description
    )
        public
        onlyHolders
    {
        require(_amount > 0, 'JACD: proposal amount of 0');
        require(_amount <= usdcBalance / 10, 'JACD: proposal exceeds 10% limit');
        //require(!_description, 'JACD: no proposal description');  HOW TO DO THIS?  DOES IT NEED DONE AT ALL/ON BACKEND?
        require(_recipient != address(0), 'JACD: invalid proposal recipient address');

        proposalCount++;

        Proposal memory proposal;
        proposal.index = proposalCount;
        proposal.recipient = _recipient;
        proposal.amount = _amount;
        proposal.description = _description;

        proposals[proposalCount] = proposal;

        //emit new proposal event
        emit Propose(proposalCount,
            _recipient,
            _amount,
            _description,
            msg.sender,
            block.timestamp
        );
    }

    // Handle votes (call votes contracts? or let votes contracts handle it all?)
        // Burn tokens used to vote

    // Finalize proposals & distribute funds

}
