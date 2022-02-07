const path = require('path')
const solc = require('solc')
const fs = require('fs-extra')

const CONTRACT_FILENAME = 'Campaign.sol'
const contractPath = path.resolve(__dirname, 'contracts', CONTRACT_FILENAME)
const buildPath = path.resolve(__dirname, 'build')

/** Read the contract file */
const source = fs.readFileSync(contractPath, 'utf-8')
/** Compile the Solidity code */
console.log('[COMPILE]:', contractPath)
const compiledSource = solc.compile(source, 1).contracts
/** Remove the build directory */
console.log('[REMOVE]:', buildPath)
fs.removeSync(buildPath)
/** Re-Create the build directory before writing */
console.log('[CREATE]:', buildPath)
fs.ensureDirSync(buildPath)
/** Loop over the compiled source to create separate build files for each contract */
for (const contract in compiledSource) {
  /** Create the file path inside build */
  const filePath = path.resolve(buildPath, contract.split(':')[1] + '.json')
  /** Save the output into file */
  console.log('[BUILD Contract]:', contract.split(':')[1])
  fs.outputJSONSync(filePath, compiledSource[contract])
}
