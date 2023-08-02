JACD is a decentralized autonomous organization (DAO) created with the intent of collecting funds from the JADU community and from the public at large for the purpose of donating to charitable causes.

All JADU NFT holders and all public contributors to the DAO will have the ability to create new proposals and voting privileges to determine which organizations will become beneficiaries of the DAO.

Instructions for setting up your own version of the NFT & token gated DAO:
    1.	Collect addresses for token to be used for contributions and distributions; a mock version of USDC is used for testing purposes
    2.	Deploy and collect address for JACD token to be used for voting
    3.	Collect address(es) of all NFT collections to be used for DAO privileges; a basic version of the Dapp Punks NFT project from the Dapp University Mentorship program was used for testing to mimic the Jetpack, Hoverboard, and AVA NFTs of the JADU project.
    4.	Deploy and collect address for the DAO contract with the following parameters:
        a.	JACD token address.
        b.	Contribution/distribution token address.
        c.	Array of NFT project addresses.
        d.	Maximum percentage of the treasury that can be allocated to any one proposal.
        e.	The amount of votes (weight) each NFT receives during the open voting stage.
        f.	The total number of votes possible, one for each NFT of each project, during the holder voting stage.
        g.	Minimum number of votes required to successfully pass holder voting stage.
        h.	Minimum number of votes required to successfully pass open voting stage.
        i.	Amount of time a proposal is open for voting during the holder voting stage.
        j.	Amount of time a proposal is open for voting during the open voting stage.
    5.	Transfer ownership of the JACD token to the DAO so it can control distributions for donations.
    6.  Use addresses logged to console during deployment to populate the config.json address values

