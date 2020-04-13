import * as axios from "axios";
import web3 from 'web3';
import resolve from 'did-resolver';
import Box from '3box';

const DeployerJSON =  require('../abis/Deployer.json');
const PartyJSON = require('../abis/Party.json');

export const getUniqueAddress = async (thread) => {
  const posts = await thread.getPosts();
  const DIDs = [...new Set(posts.map(x => x.author))];
  return Promise.all(DIDs.map(async (did) => (await resolve(did)).publicKey[2].ethereumAddress))
}


export const openBox = async (ethereum) => {
  if (!ethereum) console.error('You must provide an ethereum object to the comments component.');

  const addresses = await ethereum.enable();
  const currentUserAddr = addresses[0];
  return (await Box.openBox(currentUserAddr, ethereum));
  // await box.auth([name], { address: currentUserAddr });
}

export const openSpace = async (name, box) => {
  console.log(box)
  const space = await box.openSpace(name)
  // await space.syncDone

  return space;
}

export const activeThread = async (space, adminAddress) => {
  const spaces = await Box.listSpaces(adminAddress);
  if (!spaces.includes(space._name)) {
    console.log(adminAddress)
    console.log('Admin needs to create the room')
    return false;
  }

  return true;
}

// Dependent structure
export const getDeployerContract = (web3, address) => {
  return new web3.eth.Contract(DeployerJSON, address)
}

export const getPartyContract = (web3, address) => {
  return new web3.eth.Contract(PartyJSON, address)
}

export const DeployerAddress  =  {
  "0": "0x3361aa92E426E052141Daf9e41A09d36e994Ba23",
  "3": "0xA7514DFD86640A20eCa83a27eAD1C1213DA35f92",
  "4": "0xEA36d4e2C27f870b281E896D452ae1D9d2D32B65",
  "42": "0x9C7DbAe0A2EeF05D08E2e18Ff6173dFf7c5537eB",
}

export const getEventInfo = async (partyAddress) =>  await fetch('https://live.api.kickback.events/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "operationName":"getParty",
    "variables": {
      "address": partyAddress
    },
    "query": `fragment ProfileFields on UserProfile {
              id 
              address
              username
              realName
              roles
              social {
                type
                value
                __typename
              }
              legal {
                id
                type
                accepted
                __typename
              }
              email {
                verified
                pending
                __typename
              }
              __typename
            }
            
            fragment ParticipantFields on Participant {
              user {
                ...ProfileFields
                __typename
              }
              status
              index
              __typename
            }
            
            fragment PartyFields on Party {
              id
              address
              name
              description
              timezone
              start
              end
              arriveBy
              location
              headerImg
              balance
              deposit
              tokenAddress
              coolingPeriod
              participantLimit
              ended
              cancelled
              status
              roles {
                role
                user {
                ...ProfileFields
                __typename
              }
              __typename
            }
            participants {
                ...ParticipantFields
                __typename
            }
            __typename
          }
          
          query getParty($address: String!) {
            party(address: $address) {
              ...PartyFields
              __typename
            }
          }`})
});

export const populateEvents = async (event) =>  {
  console.log(event)
  const partyAddress = event.returnValues.deployedAddress;
  const getInfo = await getEventInfo(partyAddress);
  const data = await getInfo.json();

  return {
    'address': partyAddress,
    'data': {...data.data.party,
      abi: PartyJSON,
      admin: '0xed628E601012cC6Fd57Dc0cede2A527cdc86A221', //event.returnValues.deployer
    },
  }
}


// Contract Specific
export const initWearerKickback = (web3, address, spaceName) => {
  return {
    mainContract: getDeployerContract(web3, address),
    eventContract: (address) => getPartyContract(web3, address),
    searchEvent: 'NewParty',
    isMember: 'isRegistered',
    spaceName: spaceName,
    populate: populateEvents,
  }
}

export const getEvents = async (config, limit=0, fromBlock=0, toBlock='latest') => {
  const contract =  config.mainContract;
  const events = await contract.getPastEvents(config.eventContract, {fromBlock: fromBlock, to: toBlock})

  return Promise.all(events.slice(0, limit).map(config.populate))
}


export const isMember = async (contract, address, config) => {
  return !(await contract.methods[config.isMember](address).call());
}


export const joinThread = async (contract, address, name, space, adminAddress, config) => {
  const isMemmber = await isMember(contract, address, config)

  if (!(await activeThread(space, adminAddress))) {
    console.log(adminAddress)
    console.log('Admin needs to create the room')
    return;
  }

    const thread = (await space.joinThread(name, {
      firstModerator: adminAddress,
    }));

    console.log(thread)
    if (isMemmber.returnValues) {
      console.log('====== SUBSCRIBE')
      space.subscribeThread(thread.address, {
        name,
        firstModerator: adminAddress,
      })
    }
    return  thread

  // console.log(adminAddress)
  // return Box.getThread(space, name, adminAddress, false)
};
