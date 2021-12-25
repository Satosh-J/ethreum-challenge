const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TimeWindow contract", function () {

  let TimeWindow;
  let token;
  let owner;
  let addr1;
  let addr2;
  let startTime = 0;
  let endTime = 2 ** 32 - 1;

  // Deploy contract with startTime and endTime
  async function deployContract(startTime, endTime) {

    TimeWindow = await ethers.getContractFactory("TimeWindow");
    [owner, addr1, addr2] = await ethers.getSigners();

    token = await TimeWindow.deploy(startTime, endTime);
  }

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      // Deploy contract
      await deployContract(startTime, endTime);
      
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      // Deploy contract
      await deployContract(startTime, endTime);
      
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    
    it("Should fail to tranfer outside of time window", async function () {
      // Deploy contract, with 'mining' block outside time window
      await deployContract(startTime, startTime);
      
      await expect(token.transfer(addr1.address, 500)).to.be.revertedWith("Cant transfer now");
      
      // Even without approve, transferFrom fails with Error "Cant transfer now"
      // await token.approve(addr1.address, 100);
      
      await expect(token.transferFrom(addr1.address, addr2.address, 100)).to.be.revertedWith("Cant transfer now");
    });
    
    it("Should fail to mint from unauthorized accounts", async function(){
      await expect(token.mint(addr1.address, 500)).to.be.revertedWith("Address not authorized");
    });

    it("Should transfer tokens between accounts", async function () {
      // Deploy contract, with 'mining' block inside time window
      await deployContract(startTime, endTime);

      // Transfer 50 tokens from owner to addr1
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
      
      // Transfer 50 tokens from addr1 to addr2
      await token.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      // Deploy contract, with 'mining' block inside time window
      await deployContract(startTime, endTime);

      // Get initial balance of owner
      const initialOwnerBalance = await token.balanceOf(owner.address);
      
      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        
        // Owner balance shouldn't have changed
        expect(await token.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
          );
    });
        
    it("Should update balances after transfers", async function () {
      // Deploy contract, with 'mining' block inside time window
      await deployContract(startTime, endTime);

      // Get initial balance of owner
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1
      await token.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2
      await token.transfer(addr2.address, 50);

      // Check balances
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
