import { Contract } from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
} from "../constants";

/*
    getAmountOfTokensReceivedFromSwap:  Returns the number of Eth/Rivera tokens that can be received 
    when the user swaps `_swapAmountWei` amount of Eth/Rivera tokens.
*/
export const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected,
    ethBalance,
    reservedRT
) => {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        provider
    );
    let amountOfTokens;
    // If `Eth` is selected this means our input value is `Eth` which means our input amount would be
    // `_swapAmountWei`, the input reserve would be the `ethBalance` of the contract and output reserve
    // would be the `Rivera` token reserve
    if (ethSelected) {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            ethBalance,
            reservedRT
        );
    } else {
        // If `Eth` is not selected this means our input value is `Rivera` tokens which means our input amount would be
        // `_swapAmountWei`, the input reserve would be the `Rivera` token reserve of the contract and output reserve
        // would be the `ethBalance`
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            reservedRT,
            ethBalance
        );
    }

    return amountOfTokens;
};

/*
  swapTokens: Swaps `swapAmountWei` of Eth/Rivera tokens with `tokenToBeReceivedAfterSwap` amount of Eth/Rivera tokens.
*/
export const swapTokens = async (
    signer,
    swapAmountWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
) => {
    // Create a new instance of the exchange contract
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        signer
    );
    const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
    );
    let tx;
    // If Eth is selected call the `ethToRiveraToken` function else
    // call the `riveraTokenToEth` function from the contract
    // As you can see you need to pass the `swapAmount` as a value to the function because
    // it is the ether we are paying to the contract, instead of a value we are passing to the function
    if (ethSelected) {
        tx = await exchangeContract.ethToRiveraToken(
            tokenToBeReceivedAfterSwap,
            {
                value: swapAmountWei,
            }
        );
    } else {
        // User has to approve `swapAmountWei` for the contract because `Rivera` token
        // is an ERC20
        tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            swapAmountWei.toString()
        );
        await tx.wait();
        // call riveraTokenToEth function which would take in `swapAmountWei` of `Rivera` tokens and would
        // send back `tokenToBeReceivedAfterSwap` amount of `Eth` to the user
        tx = await exchangeContract.riveraTokenToEth(
            swapAmountWei,
            tokenToBeReceivedAfterSwap
        );
    }
    await tx.wait();
};