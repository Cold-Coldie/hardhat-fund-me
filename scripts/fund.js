const { ethers } = require("hardhat");

async function main() {
	const deployer = await ethers.provider.getSigner();

	const fundMe = await ethers.getContractAt(
		"FundMe",
		(
			await ethers.getContractFactory("FundMe")
		).runner.address,
		deployer
	); // most recently deployed fundme contract

	console.log(`Got contract FundMe at ${await fundMe.getAddress()}`);
	console.log("Funding contract...");

	const transactionResponse = await fundMe.fund({
		value: ethers.parseEther("0.1"),
	});
	await transactionResponse.wait();

	console.log("Funded!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
