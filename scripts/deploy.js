async function main() {

    const startTime = 1;
    const endTime = 20000000;
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("TimeWindow");
    const token = await Token.deploy(startTime, endTime);

    const Contribution = await ethers.getContractFactory("Contribution");
    const contribution = await Contribution.deploy();
  
    console.log("Token address:", token.address);
    console.log("Contribution address:", contribution.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });