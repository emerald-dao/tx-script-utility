import { config } from "@onflow/fcl";

const title = "Flow Runner";
const testnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
};

const mainnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-mainnet-beta.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
};

config(testnetConfig);

export const configureForNetwork = (network) => {
    if (network === "testnet") {
        config(testnetConfig);
    } else if (network === "mainnet") {
        config(mainnetConfig);
    }
};
