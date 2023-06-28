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

    mapping(uint256 => mapping(address => bool)) public holderVoted;

    enum VoteStage {Holder, All, Finalized, Failed}

    struct Proposal {
        uint256 index;
        address recipient;
        uint256 amount;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        VoteStage stage;
        uint256 voteEnd;
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

    event Vote(
        uint256 proposal,
        address voter,
        bool voteFor,
        uint256 votes,
        uint256 timestamp
    );

    event VotePass(
        uint256 proposal,
        VoteStage stage,
        uint256 votesFor,
        uint256 votesAgainst
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
        require(bytes(_description).length > 0, 'JACD: no proposal description');
        require(_recipient != address(0), 'JACD: invalid proposal recipient address');

        proposalCount++;

        Proposal memory proposal;
        proposal.index = proposalCount;
        proposal.recipient = _recipient;
        proposal.amount = _amount;
        proposal.description = _description;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.stage = VoteStage.Holder;
        proposal.voteEnd = block.timestamp + 604800;

        proposals[proposalCount] = proposal;

        emit Propose(proposalCount,
            _recipient,
            _amount,
            _description,
            msg.sender,
            block.timestamp
        );
    }

    function holdersVote(uint256 _index, bool _voteFor) public onlyHolders {
        require(proposals[_index].stage == VoteStage.Holder, 'JACD: not in holder voting stage');
        require(holderVoted[_index][msg.sender] == false, 'JACD: holder already voted');
        require(proposals[_index].voteEnd > block.timestamp, 'JACD: holder voting expired');

        uint256 votes;

        if (jetpacks.balanceOf(msg.sender) > 0) {
            votes += jetpacks.balanceOf(msg.sender) * 66666;
        }
        if (hoverboards.balanceOf(msg.sender) > 0) {
            votes += hoverboards.balanceOf(msg.sender) * 11111;
        }
        if (avas.balanceOf(msg.sender) > 0) {
            votes += avas.balanceOf(msg.sender) * 6666;
        }

        if (_voteFor) {
            proposals[_index].votesFor += votes;
        } else {
            proposals[_index].votesAgainst += votes;
        }

        holderVoted[_index][msg.sender] = true;

        emit Vote(_index, msg.sender, _voteFor, votes, block.timestamp);
    }

    function finalizeHoldersVote(uint256 _index) public onlyHolders {
        uint256 totalVotes = proposals[_index].votesFor + proposals[_index].votesAgainst;
        uint256 maxVotes = 222197778;

        Proposal storage proposal = proposals[_index];

        //require stage be holders
        require(
            block.timestamp > proposal.voteEnd ||
            totalVotes == maxVotes,
            'JACD: vote has not ended'
        );

        if (totalVotes >= (maxVotes / 2) && proposal.votesFor > proposal.votesAgainst) {
            emit VotePass(
                proposal.index,
                proposal.stage,
                proposal.votesFor,
                proposal.votesAgainst
            );

            proposal.stage = VoteStage.All;
            proposal.votesFor = 0;
            proposal.votesAgainst = 0;
            proposal.voteEnd = block.timestamp + 1209600;
        } else {
            proposal.stage = VoteStage.Failed;
        }
    }

    // Finalize proposals & distribute funds

}
