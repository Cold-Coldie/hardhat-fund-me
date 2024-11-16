// function deployFunc() {
// 	console.log("Hi");
// }

// module.exports.default = deployFunc;

const {
	networkConfig,
	developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = await getChainId();

	let ethUsdPriceFeedAddress;

	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	log("----------------------------------------------------");
	log("Deploying FundMe and waiting for confirmations...");

	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress], // put the price feed address
		log: true,
		// we need to wait if on a live network so we can verify properly
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	log(`FundMe deployed at ${fundMe.address}`);

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, [ethUsdPriceFeedAddress]);
	}
	log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
