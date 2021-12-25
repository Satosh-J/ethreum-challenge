const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contribution contract", async function () {

    let Contribution;
    let contribution;
    let Token;
    let token;
    let owner;
    let addr1;

    beforeEach(async function () {
      // Get the Signers here
      [owner, addr1] = await ethers.getSigners();

      // Deploy contribution contract from owner
      Token = await ethers.getContractFactory("TimeWindow", owner);
      token = await Token.deploy(0, 2 ** 32 - 1);
      
      // Deploy contribution contract from addr1
      Contribution = await ethers.getContractFactory("Contribution", addr1);
      contribution = await Contribution.deploy(); 
    })
    
    describe("Transactions", async function(){
      it("Should fail to contribute with no eth", async function(){
        await expect(contribution.contribute()).to.be.revertedWith("No eth sent");
      })
  
      it("Donator should receive tokens in return for his donated eth", async function () {
        
        let donateMoney = 1.323;
        
        // const price = await contribution.MINT_PRICE();
        const price = 0.01;
        
        // let buyAmount = Math.floor(donateMoney / 0.01);
        let buyAmount = Math.floor(donateMoney / price);
        await contribution.setTimeWindowAddress(token.address);
  
        await token.setContributionAddress(contribution.address);
        await contribution.contribute({value: ethers.utils.parseEther(donateMoney.toString())});
  
        
        const mintedAmount = await token.balanceOf(addr1.address);
        expect(mintedAmount).to.equal(buyAmount);
      });
    });
    
    describe("Events", function(){
      it("Should emit TokenIssued event when token minted to contributer", async function(){
        await contribution.setTimeWindowAddress(token.address);
        await token.setContributionAddress(contribution.address);
    
        await expect(contribution.contribute({value: ethers.utils.parseEther('1')}))
          .to.emit(contribution, 'TokenIssued')
          .withArgs(addr1.address, 1 / 0.01); // Here, assume 0.01 eth per token which is equal to MINT_PRICE in contribution contract
      });
    });
});
