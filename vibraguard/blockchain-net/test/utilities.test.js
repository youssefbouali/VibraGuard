import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Smart Contract Utilities", function () {
  describe("Address Validation", function () {
    it("should validate Ethereum addresses", function () {
      const validAddress = "0x1234567890123456789012345678901234567890";
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(validAddress);
      expect(isValid).to.be.true;
    });

    it("should reject invalid addresses", function () {
      const invalidAddress = "0x123";
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(invalidAddress);
      expect(isValid).to.be.false;
    });
  });

  describe("Data Conversion", function () {
    it("should convert between units", function () {
      const weiValue = ethers.parseEther("1.5");
      const etherValue = ethers.formatEther(weiValue);
      expect(etherValue).to.equal("1.5");
    });
  });
});
