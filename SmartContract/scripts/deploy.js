const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {

  const RiveraToken = await ethers.deployContract("RiveraToken");
  await RiveraToken.waitForDeployment();
  console.log("Your Token Deployed to ", await RiveraToken.getAddress());

  const tokenAdress = RiveraToken.getAddress();

  const deployedContract = await ethers.deployContract("Exchange", [tokenAdress]);

  await deployedContract.waitForDeployment();

  // print the address of the deployed contract
  // await console.log("Exchange Contract Address:", deployedContract.target); alsso a method to get addres
  console.log("Exchange Contract Address:", await deployedContract.getAddress());
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

