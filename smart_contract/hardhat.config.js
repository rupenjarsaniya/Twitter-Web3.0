require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
    solidity: "0.8.17",
    defaultNetwork: "goerli",
    networks: {
        goerli: {
            url: API_URL,
            accounts: [PRIVATE_KEY],
        },
    },
};
