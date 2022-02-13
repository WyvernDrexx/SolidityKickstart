const ganache = require('ganache-cli')
const assert = require('assert')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const compiledFactory = require('../ethereum/build/CampaignFactory.json')
const compiledCampaign = require('../ethereum/build/Campaign.json')

let accounts = []
let factory = null
let campaignAddress
let campaign

beforeEach(async () => {
  accounts = await web3.eth.getAccounts()
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({
      data: compiledFactory.bytecode
    })
    .send({
      from: accounts[0],
      gas: '1000000'
    })
  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  })
  ;[campaignAddress] = await factory.methods.getDeployedCampaigns().call()
  campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress)
})

describe('Campaigns', () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory?.options?.address)
    assert.ok(campaign.options.address)
  })
  it('sets manager as the caller itself', async () => {
    const manager = await campaign.methods.manager().call()
    assert.equal(manager, accounts[0])
  })
  it('contributes and add the account on approvers', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    })
    const isContributor = await campaign.methods.approvers(accounts[1]).call()
    assert(isContributor)
  })
  it('requires min contribution', async () => {
    let flag = null
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '5'
      })
      // Error was not thrown hence, to flag to false
      flag = false
    } catch (error) {
      // There was an error, hence, set flag to true ie pass
      flag = true
    }
    // if flag is true then, the check is passed
    assert(flag)
  })
  it('allows a manager to create a payment request', async () => {
    await campaign.methods.createRequest('Buying batteries', '100', accounts[1]).send({
      from: accounts[0],
      gas: '1000000'
    })
    const request = await campaign.methods.requests(0).call()
    assert.equal('Buying batteries', request.description)
  })
})
