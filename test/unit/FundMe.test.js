const { assert, expect } = require("chai");
const { deployments, ethers } = require("hardhat");

describe("FundMe", async () => {
	let fundMe;
	let deployer;
	let mockV3Aggregator;
	const sendValue = ethers.parseEther("1"); // 1 ETH
	beforeEach(async () => {
		// Deploy our fundMe contract using hard-har deploy

		deployer = await ethers.provider.getSigner();
		await deployments.fixture(["all"]);
		fundMe = await ethers.getContractAt(
			"FundMe",
			(
				await deployments.get("FundMe")
			).address,
			deployer
		); // most recently deployed fundme contract
		mockV3Aggregator = await ethers.getContractAt(
			"MockV3Aggregator",
			(
				await deployments.get("MockV3Aggregator")
			).address,
			deployer
		);
	});

	describe("constructor", async () => {
		it("sets the aggregator address correctly", async () => {
			const response = await fundMe.getPriceFeed();
			assert.equal(response, await mockV3Aggregator.getAddress());
		});
	});

	describe("fund", async () => {
		it("fails if you don't send enough ETH", async () => {
			await expect(fundMe.fund()).to.be.revertedWith(
				"You need to spend more ETH!"
			);
		});
		it("updated the amount funded data structure", async () => {
			await fundMe.fund({ value: sendValue });
			const response = await fundMe.getAddressToAmountFunded(deployer);
			assert.equal(response.toString(), sendValue.toString());
		});
		it("adds funders to array of funders", async () => {
			await fundMe.fund({ value: sendValue });
			const funder = await fundMe.getFunder(0);
			assert.equal(funder, await deployer.getAddress());
		});
	});

	describe("withdraw", async () => {
		beforeEach(async () => {
			await fundMe.fund({ value: sendValue });
		});

		it("withdraws ETH from a single founder", async () => {
			// Arrange
			const startingFundMeBalance = await ethers.provider.getBalance(
				await fundMe.getAddress()
			);
			const startingDeployerBalance = await ethers.provider.getBalance(
				deployer
			);

			// Act
			const transactionResponse = await fundMe.withdraw();
			const transactionReceipt = await transactionResponse.wait(1);

			// Ensure `gasUsed` and `effectiveGasPrice` are BigNumbers
			const gasUsed = transactionReceipt.gasUsed;
			const effectiveGasPrice =
				transactionReceipt.effectiveGasPrice ||
				transactionResponse.gasPrice;
			const gasCost =
				BigInt(gasUsed.toString()) *
				BigInt(effectiveGasPrice.toString());
			// Perform BigNumber multiplication

			const endingFundMeBalance = await ethers.provider.getBalance(
				await fundMe.getAddress()
			);

			const endingDeployerBalance = await ethers.provider.getBalance(
				deployer
			);

			// Convert all BigNumber values to BigInt for arithmetic operations
			const startingDeployerBalanceBigInt = BigInt(
				startingDeployerBalance.toString()
			);
			const startingFundMeBalanceBigInt = BigInt(
				startingFundMeBalance.toString()
			);
			const gasCostBigInt = BigInt(gasCost.toString());

			// Perform arithmetic using BigInt
			const expectedDeployerBalanceBigInt =
				startingDeployerBalanceBigInt +
				startingFundMeBalanceBigInt -
				gasCostBigInt;

			// Assert
			assert.equal(
				endingFundMeBalance.toString(),
				"0",
				"FundMe balance should be zero after withdrawal"
			);

			// Compare the final BigInt with the ending deployer balance
			assert.equal(
				endingDeployerBalance.toString(),
				expectedDeployerBalanceBigInt.toString(),
				"Deployer balance should reflect withdrawal minus gas costs"
			);
		});
	});
});
