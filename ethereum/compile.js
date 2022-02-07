const path = require('path')
const solc = require('solc')
const fs = require('fs-extra')

const CONTRACT_FILENAME = 'Campaign.sol'
const contractPath = path.resolve(__dirname, 'contracts', CONTRACT_FILENAME)
const buildPath = path.resolve(__dirname, 'build')

/** Read the contract file */
const source = fs.readFileSync(contractPath, 'utf-8')
/** Compile the Solidity code */
const compiledSource = solc.compile(source, 1).contracts
/** Remove the build directory */
fs.removeSync(buildPath)
/** Re-Create the build directory before writing */
fs.ensureDirSync(buildPath)
/** Loop over the compiled source to create separate build files for each contract */
for (const contract in compiledSource) {
  /** Create the file path inside build */
  const filePath = path.resolve(buildPath, contract.replace(':', '') + '.json')
  /** Save the output into file */
  console.log(`[BUILD Contract]: [${contract.replace(':', '')}] into file: [${filePath}]`)
  fs.outputJSONSync(filePath, compiledSource[contract])
}
