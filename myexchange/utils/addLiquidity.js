import { Contract, utils } from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
} from "../constants";

/**
 * addLiquidity helps add liquidity to the exchange,
 * If the user is adding initial liquidity, user decides the ether and RT tokens he wants to add
 * to the exchange. If he is adding the liquidity after the initial liquidity has already been added
 * then we calculate the Rivera tokens he can add, given the Eth he wants to add by keeping the ratios
 * constant
 */
export const addLiquidity = async (
    signer,
    addRTAmountWei,
    addEtherAmountWei
) => {
    try {
        // create a new instance of the token contract
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
        );
        // create a new instance of the exchange contract
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );
        // Because RT tokens are an ERC20, user would need to give the contract allowance
        // to take the required number RT tokens out of his contract
        let tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            addRTAmountWei.toString()
        );
        await tx.wait();
        // After the contract has the approval, add the ether and RT tokens in the liquidity
        tx = await exchangeContract.addLiquidity(addRTAmountWei, {
            value: addEtherAmountWei,
        });
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
};

/**
 * calculateRT calculates the RT tokens that need to be added to the liquidity
 * given `_addEtherAmountWei` amount of ether
 */
export const calculateRT = async (
    _addEther = "0",
    etherBalanceContract,
    rtTokenReserve
) => {
    // `_addEther` is a string, we need to convert it to a Bignumber before we can do our calculations
    // We do that using the `parseEther` function from `ethers.js`
    const _addEtherAmountWei = utils.parseEther(_addEther);

    // Ratio needs to be maintained when we add liquidity.
    // We need to let the user know for a specific amount of ether how many `RT` tokens
    // He can add so that the price impact is not large
    // The ratio we follow is (amount of Rivera tokens to be added) / (Rivera tokens balance) = (Eth that would be added) / (Eth reserve in the contract)
    // So by maths we get (amount of Rivera tokens to be added) = (Eth that would be added * Rivera tokens balance) / (Eth reserve in the contract)

    const RiveraTokenAmount = _addEtherAmountWei
        .mul(rtTokenReserve)
        .div(etherBalanceContract);
    return RiveraTokenAmount;
};