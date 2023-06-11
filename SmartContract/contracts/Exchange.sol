// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public RiveraTokenAdress;

    constructor(address _token) ERC20("RiveraTokenLP", "RTP") {
        require(_token != address(0), "Token address passed is null");
        RiveraTokenAdress = _token;
    }

    function getReserv() public view returns (uint) {
        return ERC20(RiveraTokenAdress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalnce = address(this).balance;
        uint riveraTokenReserve = getReserv();
        ERC20 RiveraToken = ERC20(RiveraTokenAdress);

        if (riveraTokenReserve == 0) {
            RiveraToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalnce;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalnce - msg.value;

            uint riveraTokenAmount = (msg.value * riveraTokenReserve) /
                (ethReserve);

            require(
                _amount >= riveraTokenAmount,
                "amount of token are less than required"
            );

            RiveraToken.transferFrom(
                msg.sender,
                address(this),
                riveraTokenAmount
            );
        }
    }
}
