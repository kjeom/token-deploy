//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@kaiachain/contracts/KIP/token/KIP7/KIP7.sol";
import "@kaiachain/contracts/access/Ownable.sol";

contract HappyToken is KIP7, Ownable {
    constructor() KIP7("HappyToken", "HTK") {
        _mint(msg.sender, 1000000 * (10 ** decimals()));
    }
}
