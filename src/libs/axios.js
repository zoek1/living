const _axios = require('axios');

var axios = _axios.create({
  baseURL: 'https://map-api-direct.foam.space:443',
});

var getConfigContracts = function()
{
  return axios({ url: '/config/contracts'
    , method: 'get'
    });
}



var getConfigNetwork = function()
{
  return axios({ url: '/config/network'
    , method: 'get'
    });
}



var getTransaction = function(from, emitter, ordering, fromBlock, toBlock)
{
  return axios({ url: '/transaction' + '?from=' + encodeURIComponent(from) + '&emitter=' + encodeURIComponent(emitter) + '&ordering=' + encodeURIComponent(ordering) + '&fromBlock=' + encodeURIComponent(fromBlock) + '&toBlock=' + encodeURIComponent(toBlock)
    , method: 'get'
    });
}



var getChallengeIpfsByIpfs_hash = function(ipfs_hash)
{
  return axios({ url: '/challenge/ipfs/' + encodeURIComponent(ipfs_hash) + ''
    , method: 'get'
    });
}



var postChallengeIpfs = function(body)
{
  return axios({ url: '/challenge/ipfs'
    , method: 'post'
    , data: body
    , responseType: 'json'
    });
}



var getChallengeByPollIDDoc = function(pollID)
{
  return axios({ url: '/challenge/' + encodeURIComponent(pollID) + '/doc'
    , method: 'get'
    });
}



var getChallengeByPollIDVoters = function(pollID)
{
  return axios({ url: '/challenge/' + encodeURIComponent(pollID) + '/voters'
    , method: 'get'
    });
}



var getChallengeContract = function(fromBlock, toBlock, listingHash, pollID)
{
  return axios({ url: '/challenge/contract' + '?fromBlock=' + encodeURIComponent(fromBlock) + '&toBlock=' + encodeURIComponent(toBlock) + '&listingHash[]=' + encodeURIComponent(listingHash) + '&pollID[]=' + encodeURIComponent(pollID)
    , method: 'get'
    });
}



var getTokenTransfers = function(fromAddress, toAddress, fromBlock, toBlock)
{
  return axios({ url: '/token/transfers' + '?fromAddress=' + encodeURIComponent(fromAddress) + '&toAddress=' + encodeURIComponent(toAddress) + '&fromBlock=' + encodeURIComponent(fromBlock) + '&toBlock=' + encodeURIComponent(toBlock)
    , method: 'get'
    });
}



var getTokenHolders = function(atBlock)
{
  return axios({ url: '/token/holders' + '?atBlock=' + encodeURIComponent(atBlock)
    , method: 'get'
    });
}



var getPoiMap = function(swLng, swLat, neLng, neLat, sort, limit, offset)
{
  return axios({ url: '/poi/map' + '?swLng=' + encodeURIComponent(swLng) + '&swLat=' + encodeURIComponent(swLat) + '&neLng=' + encodeURIComponent(neLng) + '&neLat=' + encodeURIComponent(neLat) + '&sort=' + encodeURIComponent(sort) + '&limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset)
    , method: 'get'
    });
}



var getPoiDetailsByListingHash = function(listingHash)
{
  return axios({ url: '/poi/details/' + encodeURIComponent(listingHash) + ''
    , method: 'get'
    });
}



var getPoiByListingHash = function(listingHash)
{
  return axios({ url: '/poi/' + encodeURIComponent(listingHash) + ''
    , method: 'get'
    });
}



var getPoiInvalid = function()
{
  return axios({ url: '/poi/invalid'
    , method: 'get'
    });
}



var getPoiIpfsByHash = function(hash)
{
  return axios({ url: '/poi/ipfs/' + encodeURIComponent(hash) + ''
    , method: 'get'
    });
}



var getPoiIpfsRawByHash = function(hash)
{
  return axios({ url: '/poi/ipfs/raw/' + encodeURIComponent(hash) + ''
    , method: 'get'
    });
}



var postPoiIpfs = function(body)
{
  return axios({ url: '/poi/ipfs'
    , method: 'post'
    , data: body
    , responseType: 'json'
    });
}



var getPoiAddress = function(lng, lat)
{
  return axios({ url: '/poi/address' + '?lng=' + encodeURIComponent(lng) + '&lat=' + encodeURIComponent(lat)
    , method: 'get'
    });
}



var getPoiFiltered = function(creator, challenger, voter, status, sort, swLng, swLat, neLng, neLat, limit, offset)
{
  return axios({ url: '/poi/filtered' + '?creator=' + encodeURIComponent(creator) + '&challenger=' + encodeURIComponent(challenger) + '&voter=' + encodeURIComponent(voter) + '&status[]=' + encodeURIComponent(status) + '&sort=' + encodeURIComponent(sort) + '&swLng=' + encodeURIComponent(swLng) + '&swLat=' + encodeURIComponent(swLat) + '&neLng=' + encodeURIComponent(neLng) + '&neLat=' + encodeURIComponent(neLat) + '&limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset)
    , method: 'get'
    });
}



var getPoiRemovedDetailsByListingHash = function(listingHash)
{
  return axios({ url: '/poi/removed/details/' + encodeURIComponent(listingHash) + ''
    , method: 'get'
    });
}



var getPoiListing = function(status, fromBlock, toBlock)
{
  return axios({ url: '/poi/listing' + '?status[]=' + encodeURIComponent(status) + '&fromBlock=' + encodeURIComponent(fromBlock) + '&toBlock=' + encodeURIComponent(toBlock)
    , method: 'get'
    });
}



var getSignalDetailsByCstHash = function(cstHash)
{
  return axios({ url: '/signal/details/' + encodeURIComponent(cstHash) + ''
    , method: 'get'
    });
}



var getSignalMap = function(swLng, swLat, neLng, neLat, fromBlock, toBlock)
{
  return axios({ url: '/signal/map' + '?swLng=' + encodeURIComponent(swLng) + '&swLat=' + encodeURIComponent(swLat) + '&neLng=' + encodeURIComponent(neLng) + '&neLat=' + encodeURIComponent(neLat) + '&fromBlock=' + encodeURIComponent(fromBlock) + '&toBlock=' + encodeURIComponent(toBlock)
    , method: 'get'
    });
}



var getUserByAddressAssets = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/assets'
    , method: 'get'
    });
}



var getUserByAddressVotesRevealed = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/votes/revealed'
    , method: 'get'
    });
}



var getUserByAddressVotesLocked = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/votes/locked'
    , method: 'get'
    });
}



var getUserByAddressProposal_votesLocked = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/proposal_votes/locked'
    , method: 'get'
    });
}



var getUserByAddressVotesClaimable = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/votes/claimable'
    , method: 'get'
    });
}



var getUserByAddressProposal_votesClaimable = function(address)
{
  return axios({ url: '/user/' + encodeURIComponent(address) + '/proposal_votes/claimable'
    , method: 'get'
    });
}



var getSearchPoi = function(swLng, swLat, neLng, neLat, tags, q)
{
  return axios({ url: '/search/poi' + '?swLng=' + encodeURIComponent(swLng) + '&swLat=' + encodeURIComponent(swLat) + '&neLng=' + encodeURIComponent(neLng) + '&neLat=' + encodeURIComponent(neLat) + '&tags[]=' + encodeURIComponent(tags) + '&q=' + encodeURIComponent(q)
    , method: 'get'
    });
}



var getSearchText = function(swLng, swLat, neLng, neLat, q)
{
  return axios({ url: '/search/text' + '?swLng=' + encodeURIComponent(swLng) + '&swLat=' + encodeURIComponent(swLat) + '&neLng=' + encodeURIComponent(neLng) + '&neLat=' + encodeURIComponent(neLat) + '&q=' + encodeURIComponent(q)
    , method: 'get'
    });
}



var getStatsGlobal = function()
{
  return axios({ url: '/stats/global'
    , method: 'get'
    });
}



var getParameterizerProposals = function()
{
  return axios({ url: '/parameterizer/proposals'
    , method: 'get'
    });
}


module.exports = {
  getPoiMap,
  getPoiAddress,
  getPoiDetailsByListingHash,
  getPoiAddress,
  getPoiFiltered,
  getSearchText,
}