import { config } from "@onflow/fcl";

const title = "Flow Runner";
const testnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
};
const mainnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-mainnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
};
const emulatorConfig = {
    "app.detail.title": title,
    "accessNode.api": "http://localhost:8888",
    "discovery.wallet": "http://localhost:8701/fcl/authn",
};

config(testnetConfig);

export const configureForNetwork = (network) => {
    if (network === "testnet") {
        config(testnetConfig);
    } else if (network === "emulator") {
        config(emulatorConfig);
    } else if (network === "mainnet") {
        config(mainnetConfig);
    }
};
