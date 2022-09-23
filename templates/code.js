export const baseScript = `
// This is the most basic script you can execute on Flow Network
pub fun main():Int {
  return 42
}
`.slice(1); // remove new line at the bof

export const baseTransaction = `
// This is the most basic transaction you can execute on Flow Network
transaction() {
  prepare(signer: AuthAccount) {
    
  }
  execute {
    
  }
}
`.slice(1); // remove new line at the bof

export const getTxScript = `
import TransactionGeneration from "0xTransactionGeneration"

pub fun main(tx: String, collectionIdentifier: String, vaultIdentifier: String) : String {
    return TransactionGeneration.getTx(tx: tx, params: {
        "collectionIdentifier": collectionIdentifier,
        "vaultIdentifier": vaultIdentifier
    })!
}
`.slice(1); // remove new line at the bof
