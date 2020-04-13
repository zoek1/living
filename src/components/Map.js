import React, {Component} from "react";
import {getBoundingBox, getFOAM} from "../libs/convertions";
import ReactMapboxGl, {Layer, Feature, Popup} from 'react-mapbox-gl';
const Geohash = require("latlon-geohash").default;

const FOAM_PENDING_COLOR = [46, 124, 230];
const FOAM_VERIFIED_COLOR = [38, 171, 95];
const FOAM_CHALLENGED_COLOR = [244, 128, 104];
const FOAM_REMOVED_COLOR = [255, 0, 0];

// Functions
function getCenterPoint(bounding_box) {
  return [(bounding_box[0][0] + bounding_box[1][0]) / 2, (bounding_box[0][1] + bounding_box[1][1]) / 2];
}

function getPointColor(state) {
  if (state && state.status && state.status.type) {
    if (state.status.type === "applied") { return FOAM_PENDING_COLOR }
    else if (state.status.type === "listing") { return FOAM_VERIFIED_COLOR }
    else if (state.status.type === "challenged") { return FOAM_CHALLENGED_COLOR }
  } else {
    return FOAM_REMOVED_COLOR
  }
}

function getPointCoords(geohash) {
  const coords = Geohash.decode(geohash);
  return [coords['lon'], coords['lat']];
}

const MAX_ZOOM = 16;
const RADIUS_SCALE = 50;
const RADIUS_MIN_PIXELS = 1;
const RADIUS_MAX_PIXELS = 2.5;

const MapBox = ReactMapboxGl({
    minZoom: 8,
    maxZoom: 15,
    accessToken: 'pk.eyJ1Ijoiem9layIsImEiOiJjaWc0b2ZmaXozMTlzdXNtNXR4bzF3bWI3In0.Qiyq_HteQro9bmzovEa-3w'
});


class Map extends Component {
  constructor(props){
    super(props);
    console.log(props);
    const {location} = props;
    const point = location.point.coords;

    const boundingBox = getBoundingBox(location.point.geohash.slice(0, props.presicion ? props.presicion[0] : 10));
    const zoom = props.presicion;
    this.state = {
      // Map layout
      point,
      boundingBox: [getPointCoords(boundingBox['sw']), getPointCoords(boundingBox['ne'])],
      zoom,
      data: [],
      pointer: null
    }
  }

  componentDidMount() {
    const DATA_URL = 'https://map-api-direct.foam.space/poi/filtered?swLng=' + this.state.boundingBox[0][0] + '&swLat=' + this.state.boundingBox[0][1] + '&neLng=' + this.state.boundingBox[1][0] + '&neLat=' + this.state.boundingBox[1][1] + '&status=application&status=listing&status=challenged&status=removed&sort=most_value&limit=500&offset=0'
    fetch(DATA_URL)
      .then(response => response.json())
      .then(data => {
        this.setState({data})
        console.log(data)
      })
  }

  componentWillReceiveProps(newProps) {
    const _boundingBox = getBoundingBox(newProps.location.point.geohash.slice(0, newProps.presicion ? newProps.presicion[0] : 10));
    const boundingBox = [getPointCoords(_boundingBox['sw']), getPointCoords(_boundingBox['ne'])];
    const DATA_URL = 'https://map-api-direct.foam.space/poi/filtered?swLng=' + boundingBox[0][0] + '&swLat=' + boundingBox[0][1] + '&neLng=' + boundingBox[1][0] + '&neLat=' + boundingBox[1][1] + '&status=application&status=listing&status=challenged&status=removed&sort=most_value&limit=500&offset=0'
    fetch(DATA_URL)
      .then(response => response.json())
      .then(data => {
        this.setState((prevState, props) => {
          return {...prevState, data: data};
        })
        console.log(data)
      })
  }

  onDrag = () => {
    if (this.state.station) {
      this.setState({ station: undefined });
    }
  };

  onToggleHover(cursor, { map }) {
    map.getCanvas().style.cursor = cursor;
  }

  markerClick = (pointer, { feature }) => {
    this.setState({
      center: feature.geometry.coordinates,
      zoom: [14],
      pointer
    });
  };


  render(){
    console.log(this.state.data)
    const points = this.state.data.map( (e, i) => {
      const coords = getPointCoords(e.geohash);
      return <Feature key={i} coordinates={coords}
                      onMouseEnter={this.onToggleHover.bind(this, 'pointer')}
                      onMouseLeave={this.onToggleHover.bind(this, '')}
                      onClick={this.markerClick.bind(this, this.state.data[i])}
      />
      }
    );

    const zoom = ((this.props.presicion ? this.props.presicion[0] : 10) *20 ) /12;
    return (<>
      <div style={{margin: '10px'}}>This locations reach {points.length} POI</div>
      <MapBox
        style='mapbox://styles/mapbox/streets-v8'
        containerStyle={this.props.style || {
          height: '30vh',
          width: '40vw'
        }}
        maxZoom={MAX_ZOOM}
        center={this.props.location.point.coords}
        zoom={[Math.round(zoom)]}
      >
        <Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
          { points }
        </Layer>
        { this.state.pointer &&
          <Popup coordinates={getPointCoords(this.state.pointer.geohash)}>
            <div style={{
            'background': 'white',
            'color': '#3f618c',
            'fontWeight': 400,
            'padding': '5px',
            'borderRadius': '2px',
            }}>
              <h3>{this.state.pointer.name}</h3>
              <div><span style={{fontWeight: "bold"}}>Status</span>: <i>{this.state.pointer.state.status.type}</i></div>
              <div><span style={{fontWeight: "bold"}}>Deposit</span>: <em>{getFOAM(this.state.pointer.state.deposit)} FOAM</em></div>
              <div> <ul style={{display: 'flex', listStyle: 'none'}}>
                <span style={{fontWeight: "bold"}}>Tags</span>:
                { this.state.pointer.tags.map((tag) =>
                  <li style={{marginLeft: '3px'}}>{tag},</li>
                )}
                </ul>
            </div>
            </div>

          </Popup>
        }
      </MapBox></>);
  }
}

export default Map;