import { expect } from "chai";
import hre from "hardhat";
import { parseKaia } from "@kaiachain/ethers-ext";
import tokenContract from "../artifacts/contracts/HappyToken.sol/HappyToken.json";

describe("KIP-7 TEST", function () {
  // Project side
  var contractAddr = "";
  beforeEach("Deploy KIP-7 based token (Happy Token)", async function () {
    // Get the first account as the owner using hardhat
    const [owner] = await hre.ethers.getSigners();

    const factory = new hre.ethers.ContractFactory(
      tokenContract.abi,
      tokenContract.bytecode,
      owner
    );
    const contract = await factory.deploy();

    // ethers v5
    await contract.deployTransaction.wait();
    contractAddr = contract.address;

    // ethers v6
    // await contract.waitForDeployment();
    // contractAddr = await contract.getAddress();
  });

  it("Transfer from owner to user1", async function () {
    const [owner, user1] = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      contractAddr,
      tokenContract.abi,
      owner
    );

    console.log(
      "Before: balance of user1: ",
      parseKaia((await contract.balanceOf(owner.address)).toString()).toString()
    );

    // Transfer HappyToken from Project Owner to user1
    await contract["safeTransfer(address,uint256)"](
      user1.address,
      parseKaia("2").toString()
    );

    const balance = await contract.balanceOf(user1.address);

    expect(balance).to.equal(parseKaia("2").toString());

    console.log(
      "After: balance of user1: ",
      parseKaia((await contract.balanceOf(owner.address)).toString()).toString()
    );
  });
});
