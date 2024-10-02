# Fungible Token Deploy on kaia network

This is a guide of FT deployment, which includes how to make the contract code, test the deployment and deploy on kaia network.

## Steps

1. build a contract code via Kaia Contract Wizard (https://wizard.kaia.io/)
2. Setup the developement environment using Hardhat framwork (https://hardhat.org/)
3. compile the contract code in the environment
4. Writing test code, which is not normal hardhat testing code but "real code"

### 1. Contract code

- move to Wizard webpage (https://wizard.kaia.io)
- click the `KIP7` tab (KIP7 is a fungible token standard for kaia)
- edit the `Name` and `Symbol` (ex. Name: Wrapped Klay, Symbol: WKLAY)
- edit `Premint` amount when deploying the contract (ex. 1000 means $1000 * 10^{18}$)
- (Optional) additional features : Mintable, Burnable, .... (ex. if your project need to mint extra tokens after premint)
- (Optional) access control (if you want to control the access of this contract, please check [Access Control](https://docs.openzeppelin.com/contracts/2.x/access-control))

### 2. Setup the development environment (Hardhat)

prerequisite: node >= 18.0

#### initialization

```shell
$> mkdir ft-deploy && cd ft-deploy
$> npm init # and follow the guide for initializing npm project
$> npm i --save-dev hardhat@^2.22.12
$> npx hardhat init # and follow the guide for initializing hardhat project
$> delete contract/lock.sol, test/lock.ts and ignite folder
```

#### install libraries

```shell
npm i --save-dev ts-node typescript # if you select the typescript when initializing
npm i --save @kaiachain/contracts @kaiachain/ethers-ext
```

### 3. Compile the contract code

- create a file that has .sol extension (ex. HappyToken.sol)
- copy and paste the code generated from `Kaia Contract Wizard`
- run `npx hardhat compile`
- got the artifacts/contracts/{filename}.sol/{filename}.json

### 4. Deployment of KIP7 token

- create a file (test/ft-test.ts)
- copy and paste following code
- run `npx hardhat test`, which deploy the token contract to hardhat local node

```js
import { expect } from "chai";
import hre from "hardhat";
import { parseKaia } from "@kaiachain/ethers-ext";

// replace the json file path you get from the compile step
import tokenContract from "../artifacts/contracts/HappyToken.sol/HappyToken.json";

describe("KIP-7 TEST", function () {
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

  it("Transfer from project owner to user1", async function () {
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
  });
});
```

### Practical insights

#### Signer

```js
// Get the first account as the owner using hardhat
const [owner, user1] = await hre.ethers.getSigners();
```

This above example is getting two signers from hre (hardhat runtime environment), `owner` and `user1`. These are wallet instances from ethers inside hardhat and funded by hardhat for development convenience. You should create `Wallet` instance by `new Wallet(private key, provider)`. please look at [wallet creation](https://github.com/kaiachain/kaia-sdk/blob/dev/ethers-ext/example/v6/transactions/Basic_08_TxTypeValueTransfer.js#L16).

#### Ethers v5 vs Ethers v6

```js
// ethers v5
await contract.deployTransaction.wait();
contractAddr = contract.address;

// ethers v6
await contract.waitForDeployment();
contractAddr = await contract.getAddress();
```

`ethers` project has made a breaking change from v5 to v6. It affects to the hardhat project so if you are using old hardhat version, you can refer the v`5` code.

#### @kaiachain/ethers-ext

`ethers-ext` is a plugin library of `ethers` so it has a dependency with `ethers` version. Fortunately from ethers-ext@1.0.2, it's going to support the Ethers v5 and v6 respectively. Please look at how to switch Ethers version in [switch ethers version](https://github.com/kaiachain/kaia-sdk/pull/7#issue-2383160474).
