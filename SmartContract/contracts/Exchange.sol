// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public RiveraTokenAdress;

    constructor(address _token) ERC20("RiveraTokenLP", "RTP") {
        require(_token != address(0), "Token address passed is null");
        RiveraTokenAdress = _token;
    }

    function getReserve() public view returns (uint) {
        return ERC20(RiveraTokenAdress).balanceOf(address(this));
    }

    function addLiquidity(uint _amount) public payable returns (uint) {
        uint liquidity;
        uint ethBalnce = address(this).balance;
        uint riveraTokenReserve = getReserve();
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

            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "amount should be greated than 0");

        uint ethReserve = address(this).balance;

        uint _totalSupply = totalSupply();

        uint ethAmount = (ethReserve * _amount) / _totalSupply;

        uint reveraTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);

        ERC20(RiveraTokenAdress).transfer(msg.sender, reveraTokenAmount);

        return (ethAmount, reveraTokenAmount);
    }
}
