const { ethers } = require("hardhat");

async function main() {
	const deployer = await ethers.provider.getSigner();
	const fundMe = await ethers.getContractAt(
		"FundMe",
		(
			await ethers.getContractFactory("FundMe")
		).runner.address,
		deployer
	);
	console.log(`Got contract FundMe at ${fundMe.address}`);
	console.log("Withdrawing from contract...");
	const transactionResponse = await fundMe.withdraw();
	await transactionResponse.wait();
	console.log("Got it back!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
