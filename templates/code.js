import { cdc } from "@onflow/fcl";

export const baseScript = cdc`
// This is the most basic script you can execute on Flow Network
pub fun main():Int {
  return 42
}
`();

export const flovatarTotalSupply = cdc`
/// pragma title Flovatar Total Supply
import Flovatar from 0x01

pub fun main():UInt64{
  return Flovatar.totalSupply
}
`();

export const baseTransaction = cdc`
// This is the most basic transaction you can execute on Flow Network
transaction() {
  prepare(signer: AuthAccount) {
    
  }
  execute {
    
  }
}
`();
