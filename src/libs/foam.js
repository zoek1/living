const axios = require('axios');
const sleep = require('await-sleep');
const Geohash  = require('latlon-geohash').default;
const {
  getPoiDetailsByListingHash
} = require('./axios');

const getQueryUser = (address) => {
  return {
    query: `{ 
      user(id: "${address}") {
        id
        numChallenges
        numListingApplications
        numListingsWhitelisted
        numVotesCommitted
        numVotesRevealed
        totalAmountStaked
        totalMapRewards
        listings(where: {whitelisted: true, wasRemoved: false, wasWithdrawn: false}, orderDirection: desc) {
          id
          whitelisted
          wasRemoved
          wasWithdrawn
          deposit
          data
        }
      }
    }`
  }
};

const GRAPQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/blocklytics/foam';

const retriveListingData = async (listings) =>  {
  return Promise.all(listings.map(async (listing, index) => {
    await sleep(150 * index );

    try {
      let res = await getPoiDetailsByListingHash(listing.id);
      console.log(Geohash)
      let lat_lng = Geohash.decode(res.data.data.geohash)
      return {...res.data.data, ...res.data.meta, coords: lat_lng};
    } catch (e) {
      console.log(e);
      throw e;
    }
  }));
};

const getUserData = (address) => {
  return axios( {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify(getQueryUser(address)),
    url: GRAPQL_ENDPOINT,
  }).then((response) => response.data ).catch((e) => console.log(e))
};

const getListings = async (address) => {
  let partial_info = await getUserData('0xc7d47d741007f1f4488b4ce23ec0b0ffa592f680');
  // let partial_info = await getUserData(address);
  let _listings = partial_info.data.user ? partial_info.data.user.listings : [];
  let listings = await retriveListingData(_listings);

  return {...partial_info.data.user, listings}
};

module.exports = {
  getUserData,
  getListings
};