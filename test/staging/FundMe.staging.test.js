const { assert } = require("chai");
const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe Staging Tests", function () {
			let deployer;
			let fundMe;
			const sendValue = ethers.parseEther("0.1");
			beforeEach(async () => {
				deployer = await ethers.provider.getSigner();
				fundMe = await ethers.getContractAt(
					"FundMe",
					(
						await deployments.get("FundMe")
					).address,
					deployer
				); // most recently deployed fundme contract
			});

			it("allows people to fund and withdraw", async function () {
				const fundTxResponse = await fundMe.fund({ value: sendValue });
				await fundTxResponse.wait(1);
				const withdrawTxResponse = await fundMe.withdraw();
				await withdrawTxResponse.wait(1);

				const endingFundMeBalance = await ethers.provider.getBalance(
					await fundMe.getAddress()
				);
				console.log(
					endingFundMeBalance.toString() +
						" should equal 0, running assert equal..."
				);
				assert.equal(endingFundMeBalance.toString(), "0");
			});
	  });
