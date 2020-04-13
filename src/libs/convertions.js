const Geohash = require('latlon-geohash').default;
const web3 = require('web3');

const hex2dec = (hex) => parseInt(hex, 16);
const coords2geaohash = (coords, precision) => Geohash.encode(coords.lat, coords.lon, precision)

const getBoundingBox = (geohash) => {
  let neight = Geohash.neighbours(geohash);

  return {'nw': neight['nw'], 'ne': neight['ne'], 'se': neight['se'], 'sw': neight['sw']}
};

const getFOAM = (foamAmount) => web3.utils.fromWei(foamAmount, 'ether');

const BN = (number) => web3.utils.toBN(number);

module.exports = {
  coords2geaohash,
  getBoundingBox,
  getFOAM,
  hex2dec
};