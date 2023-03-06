import { config } from "@onflow/fcl";

const title = "Run";
const testnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "discovery.authn.endpoint":
        "https://fcl-discovery.onflow.org/api/testnet/authn",
    "discovery.authn.include": ["0x9d2e44203cb13051", "0x82ec283f88a62e65"],
    "flow.network": "testnet",
};
const mainnetConfig = {
    "app.detail.title": title,
    "accessNode.api": "https://rest-mainnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
    "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/authn",
    "discovery.authn.include": ["0xe5cd26afebe62781", "0xead892083b3e2c6c"],
    "flow.network": "mainnet",
};
const emulatorConfig = {
    "app.detail.title": title,
    "accessNode.api": "http://localhost:8888",
    "discovery.wallet": "http://localhost:8701/fcl/authn",
    "discovery.authn.endpoint": "http://localhost:3002/api/local/authn",
    "flow.network": "local",
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
