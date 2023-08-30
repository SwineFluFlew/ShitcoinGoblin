const Web3 = require('web3');
const { infuraUrl, maxRetries, debugMode } = require('./settings');
const debugLog = require('./debugUtils');

const web3 = new Web3(infuraUrl);

let lastProcessedBlock = 0;

// Your ABI Definition
const ABIDef = [
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{ name: "", type: "address" }],
        type: "function",
    },
    // You can add more function definitions here as needed
];
const getNewTokens = async () => {
    let retries = maxRetries;
    while (retries > 0) {
        try {
            const latestBlock = await web3.eth.getBlockNumber();
            debugLog(`Latest block number: ${latestBlock}`);

            if (lastProcessedBlock === 0) {
                lastProcessedBlock = latestBlock - 1;
            }

            const newTokens = [];

            for (let blockNumber = lastProcessedBlock + 1; blockNumber <= latestBlock; blockNumber++) {
                const block = await web3.eth.getBlock(blockNumber, true);

                for (const transaction of block.transactions) {
                    if (transaction.to === null && transaction.input !== '0x') {
                        const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
                        const contractAddress = receipt.contractAddress;

                        if (contractAddress) {
                            debugLog(`New contract detected at ${contractAddress}`);

                            try {
                                const contract = new web3.eth.Contract(ABIDef, contractAddress);
                                const tokenInfo = {
                                    name: await contract.methods.name().call(),
                                    address: contractAddress,
                                };

                                try {
                                    tokenInfo.symbol = await contract.methods.symbol().call();
                                } catch (e) { }

                                try {
                                    tokenInfo.decimals = await contract.methods.decimals().call();
                                } catch (e) { }

                                try {
                                    tokenInfo.totalSupply = await contract.methods.totalSupply().call();
                                } catch (e) { }

                                try {
                                    tokenInfo.owner = await contract.methods.owner().call();
                                    tokenInfo.balance = await checkBalance(tokenInfo.owner);  // Add this line
                                } catch (e) { }

                                // Add more properties as needed
                                newTokens.push(tokenInfo);
                            } catch (error) {
                                debugLog(`Failed to fetch details for contract at ${contractAddress}`);
                                debugLog('Error details:');
                                debugLog(error); // This will print the complete error object
                                debugLog(error.message); // This will print just the error message
                                debugLog(error.stack); // This will print the stack trace
                            }
                        }
                    }
                }
            }

            lastProcessedBlock = latestBlock;
            return newTokens;
        } catch (err) {
            console.error(`Failed to fetch latest block: ${err.message}`);
            retries -= 1;
            if (retries > 0) {
                debugLog(`Retrying... [${retries} attempts left]`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('Max retries reached. Exiting.');
                process.exit(1); // or handle this more gracefully
            }
        }
    }
};

const checkBalance = async (address) => {
    try {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
        const roundedBalanceEther = parseFloat(balanceEther).toFixed(2); 
        debugLog(`Balance of ${address}: ${roundedBalanceEther} ETH`);
        return roundedBalanceEther;

    } catch (err) {
        debugLog(`Failed to get balance of ${address}: ${err}`);
        return null;
    }
};

module.exports = {
    getNewTokens,
    checkBalance
};