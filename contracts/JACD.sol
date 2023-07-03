// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import './JACDToken.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';

contract JACD {
    JACDToken public jacdToken;
    IERC20 public usdcToken;

    uint256 public holdersWeight;
    uint256 public holderVotes;
    uint256 public minHolderVotesToPass;
    uint256 public minVotesToFinalize;

    IERC721Enumerable[] public collections;

    uint256 public jacdSupply;
    uint256 public usdcBalance;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    mapping(uint256 => mapping(address => bool)) public holderVoted;
    mapping(uint256 => mapping(address => bool)) public holderAllVoted;

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
        VoteStage stage,
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

    modifier holdersOrContributors {
        bool isHolderOrContributor;

        for(uint256 i; i < collections.length; i++) {
            if(collections[i].balanceOf(msg.sender) > 0) {
                isHolderOrContributor = true;
                break;
            }

            if (isHolderOrContributor) {break;}
        }

        if((!isHolderOrContributor) && jacdToken.balanceOf(msg.sender) > 0) {
            isHolderOrContributor = true;
        }

        require(isHolderOrContributor, 'JACD: not a holder or an contributor');

        _;
    }

    modifier onlyHolders {
        bool isHolder;

        for(uint256 i; i < collections.length; i++) {
            if(collections[i].balanceOf(msg.sender) > 0) {
                isHolder = true;
                break;
            }

            if (isHolder) {break;}
        }

        require(isHolder, 'JACD: not a holder');
        _;
    }

    modifier onlyContributors {
        require(jacdToken.balanceOf(msg.sender) > 0, 'JACD: not an contributor');
        _;
    }

    constructor(
        JACDToken _jacdToken,
        IERC20 _usdcToken,
        IERC721Enumerable[] memory _collections,
        uint256 _holderVotes,
        uint256 _holdersWeight,
        uint256 _minHolderVotesToPass,
        uint256 _minVotesToFinalize
    )
    {
        jacdToken = _jacdToken;
        usdcToken = _usdcToken;
        collections = _collections;
        holderVotes = _holderVotes;
        holdersWeight = _holdersWeight;
        minHolderVotesToPass = _minHolderVotesToPass;
        minVotesToFinalize = _minVotesToFinalize;
    }

    function getCollections() public view returns (IERC721Enumerable[] memory) {
        return collections;
    }

    function collectionsLength() public view returns (uint256) {
        return collections.length;
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
        holdersOrContributors
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
        Proposal storage proposal = proposals[_index];

        require(proposal.stage == VoteStage.Holder, 'JACD: not in "holder" voting stage');
        require(!holderVoted[_index][msg.sender], 'JACD: holder already voted');
        require(proposal.voteEnd > block.timestamp, 'JACD: holder voting expired');

        uint256 votes;

        for(uint256 i; i < collections.length; i++) {
            votes += collections[i].balanceOf(msg.sender);
        }

        if (_voteFor) {
            proposal.votesFor += votes;
        } else {
            proposal.votesAgainst += votes;
        }

        holderVoted[_index][msg.sender] = true;

        emit Vote(_index, msg.sender, proposal.stage, _voteFor, votes, block.timestamp);
    }

    function finalizeHoldersVote(uint256 _index) public onlyHolders {
        Proposal storage proposal = proposals[_index];

        require(proposal.stage == VoteStage.Holder, 'JACD: not in "holder" voting stage');

        uint256 votesSubmitted = proposal.votesFor + proposal.votesAgainst;

        require(
            block.timestamp > proposal.voteEnd ||
            votesSubmitted == holderVotes,
            'JACD: vote has not ended'
        );

        if (
            votesSubmitted >= minHolderVotesToPass &&
            proposal.votesFor > proposal.votesAgainst
        ) {
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

    function allVote(uint256 _index, bool _voteFor, uint256 _tokenVotes) public holdersOrContributors {
        Proposal storage proposal = proposals[_index];

        require(proposal.stage == VoteStage.All, 'JACD: not in "all" voting stage ');
        require(
            (!holderAllVoted[_index][msg.sender]) ||
            jacdToken.balanceOf(msg.sender) > 0,
            'JACD: no votes/already voted'
        );
        require(jacdToken.balanceOf(msg.sender) >= _tokenVotes, 'JACD: insufficient JACD token votes');
        require(block.timestamp < proposal.voteEnd, 'JACD: voting time expired');

        uint256 allVotes = _tokenVotes;

        for(uint256 i; i < collections.length; i++) {
            allVotes += collections[i].balanceOf(msg.sender) * (holdersWeight * 1e18);
        }

        if (_voteFor) {
            proposal.votesFor += allVotes;
        } else {
            proposal.votesAgainst += allVotes;
        }

        if (allVotes > _tokenVotes) {
            holderAllVoted[_index][msg.sender] = true;
        }

        if(_tokenVotes > 0) {
            jacdToken.burnFrom(msg.sender, _tokenVotes);
        }

        emit Vote(_index, msg.sender, proposal.stage, _voteFor, allVotes, block.timestamp);
    }

    function finalizeProposal(uint256 _index) public onlyHolders {
        Proposal storage proposal = proposals[_index];

        require(block.timestamp > proposal.voteEnd, 'JACD: vote has not ended');
        require(
            usdcToken.balanceOf(address(this)) > proposal.amount,
            'JACD: insufficient USDC balance'
        );

        if(
            proposal.votesFor > proposal.votesAgainst &&
            proposal.votesFor + proposal.votesAgainst >= minVotesToFinalize
        ) {
            require(usdcToken.transfer(proposal.recipient, proposal.amount));
            usdcBalance -= proposal.amount;

            emit VotePass(
                proposal.index,
                proposal.stage,
                proposal.votesFor,
                proposal.votesAgainst
            );

            proposal.stage = VoteStage.Finalized;
        } else {
            proposal.stage = VoteStage.Failed;
        }

    }
}
