import React, {useEffect, useState} from "react";
import {Container, TextField} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {getListings} from "../libs/foam";
import Web3 from "web3";
import * as axios from "axios";
import {withRouter} from "react-router-dom";
import Map from "./Map";
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

const MODERATOR_ADDRESS = '0xed628E601012cC6Fd57Dc0cede2A527cdc86A221';
const PREFIX_CHANNEL_NAME = 'test_firey';
const ENDPOINT_CACHE = '/api/v0/thread/';

const get_thread_name = (title) => `${PREFIX_CHANNEL_NAME}_${title.replace(/\W/g, '')}_${Date.now()}`;

const createThread = async (address, space, title, description, locationArea, joiningPolicy, publishingPolicy, did) => {
  let threadName = get_thread_name(title);
  console.log(threadName);
  let thread;

  thread = await space.joinThread(threadName);

  if (MODERATOR_ADDRESS !== address) {
    try {
      await thread.addModerator(MODERATOR_ADDRESS);
    } catch (e) {
      console.log(e)
      console.log(`${MODERATOR_ADDRESS} already have access!`)
    }
  }

  console.log(thread);

  let response = axios({
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify({
        title: title,
        description: description,
        location: locationArea.location,
        precision: locationArea.presicion,
        joining: joiningPolicy.type,
        joiningValue: joiningPolicy.value,
        publishing: publishingPolicy.type,
        publishingValue: publishingPolicy.value,
        threadId: thread._address,
        threadName: threadName,
        moderator: address,
        is_open: joiningPolicy.type !== 'open',
        did: did,
        space: space._name,
    }),
    url: ENDPOINT_CACHE
  });

  return (await response);
};

const mdParser = new MarkdownIt(/* Markdown-it options */);

const NewThread = (props) => {
  const {
    address,
    profile,
    did,
    space,
    history,
    locations,
    limits,
    badges
  } = props;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [joining, setJoining] = useState('open');
  const [publishing, setPublishing] = useState('badge');
  const [location, _setLocation] = useState({});
  const [publishingValue, _setPublishingValue] = useState("");
  const [joiningValue, setJoiningValue] = useState("");
  const [presicion, setPresicion] = useState(6);

  const setLocation = (location) => {
    const geohash = location.geohash.slice(0, presicion);
     for(let i=0; i<locations.length;i++){
       let test = locations[i].geohash.slice(0, presicion);
       if (test === geohash) {
         _setLocation(location);
         return true;
       }
     }
     return false;
  };

  const setPublishingValue = (val) => {
    const decimal_re = /(^-?[0-9.]+)$/;
    const uint_re = /^\d+$/;

    const BN = Web3.utils.BN;
    if (val === '') {
      _setPublishingValue(val)
    }


    if (publishing === 'holding') {
      if (!val.match(decimal_re)) return;
      let requestAmount = Web3.utils.toWei(val)
      console.log(typeof requestAmount)
      console.log(requestAmount)

      if (new BN(requestAmount).lte(new BN(limits.tokens))) {
        _setPublishingValue(val)
        console.log('Update amount')
      }
    }

    if (publishing === 'points' ) {
      if (!val.match(uint_re)) return;
      if (parseInt(val) <= limits.points) {
        _setPublishingValue(val)
        console.log('Update amount')
      }
    }
    if (publishing === 'challenge' ) {
      if (!val.match(uint_re)) return;
      if (parseInt(val) <= limits.challenge) {
        _setPublishingValue(val)
        console.log('Update amount')
      }
    }

    const checkBadge = (badge, limits) => {
      if (new BN(Web3.utils.toWei(badge.req.holding.toString())).gt(new BN(limits.tokens))) return false;
      if (badge.req.challenge > limits.challenge) return false;
      if (badge.req.points > limits.points) return false;

      return true;
    };

    if (publishing === 'badge' ) {
      let badge = badges[val];
      if (checkBadge(badge, limits)) {
        _setPublishingValue(val);
        console.log('Update amount')
      }
    }
  };

  const onCreate = () => {
    if (!title) {
      alert('No title provided')
      return;
    }
    if(!description) {
      alert('No description provided')
      return;
    }

    if(Object.entries(location).length === 0) {
      alert('Needs participation in one place to create a Tread');
      return;
    }

    if(publishingValue === '') {
      alert('Indicate the publishing policy');
      return;
    }

    if (!!title && !!description && Object.entries(location).length !== 0 && publishingValue !== '') {
      createThread(address, space, title, description,
        {location, presicion},
        {type: joining, value: joiningValue},
        {type: publishing, value: publishingValue}, did, space
        ).then((response) => {
          console.log('created')
          history.push(`/threads/${response.data.id}`, {
            thread: response.data
          })
      }).catch((e) => console.log(e))
    } else {
      alert('We could create the thread, try later.');
    }

  };

  console.log(location)
  return (<Container>
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Paper style={{paddingTop: '20px'}}>
          <Typography component="h3" style={{fontWeight: 'bold',  marginTop: '10px', fontSize: '1.6em', marginBottom: '20px'}}>Create Thread</Typography>

          <form noValidate autoComplete='off'>
            <Grid container item xs={8} style={{marginLeft: '4%'}}>
              <TextField id='title' label='Thread Tile' style={{ width: '100%'}}
                         value={title}
                         onChange={ (e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid container style={{marginTop: '15px', marginBottom: '15px'}}>
              <Grid item xs={3}>
                <FormControl style={{width: '200px'}}>
                  <InputLabel id="privacy-label">Publishing</InputLabel>

                  <Select labelId="privacy-label" id='privacy'
                          value={publishing}
                          onChange={ (e) => setPublishing(e.target.value)}>
                    <MenuItem value="points">Points</MenuItem>
                    <MenuItem value="challenge">Challenges</MenuItem>
                    <MenuItem value="holding">FOAM amount</MenuItem>
                    <MenuItem value="badge">Badge</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {publishing === 'points' && <Grid  item xs={4}>
                <TextField style={{width: '100%'}} id='points' label="Min Number of Points"
                           value={publishingValue}
                           onChange={ (e) => setPublishingValue(e.target.value)}
                           helperText={`Max allowed points ${limits.points}"`}
                />
              </Grid>}
              {publishing === 'challenge' && <Grid  item xs={4}>
                <TextField style={{width: '100%'}} id='description' label="Min Number of Challenges"
                           value={publishingValue}
                           onChange={ (e) => setPublishingValue(e.target.value)}
                           helperText={`Max allowed challenges ${limits.challenge}`} />
              </Grid>}
              {publishing === 'holding' && <Grid  item xs={4}>
                <TextField style={{width: '100%'}} id='holding' label="Min FOAM amount"
                           value={publishingValue}
                           onChange={ (e) => setPublishingValue(e.target.value)}
                           helperText={`Max allowed ${Web3.utils.fromWei(limits.tokens ? limits.tokens.toString() : "")} FOAM`} />
              </Grid>}
              {publishing === 'badge' && <Grid item xs={4}>
                <FormControl style={{width: '100%'}}>
                  <InputLabel id="badge-label">Publishing</InputLabel>

                  <Select labelId="badge-label" id='privacy'
                          value={publishingValue}
                          onChange={ (e) => setPublishingValue(e.target.value)}>
                    { badges.map((b) => <MenuItem value={b.id}><img src={b.url} style={{maxWidth: '25px'}}/> {b.name} - {b.description}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>}
            </Grid>
            <Grid container item xs={12} style={{marginTop: '15px', marginBottom: '15px'}}>

              <Grid item xs={3}>
                <FormControl style={{width: '200px'}}>
                  <InputLabel id="presicion-label">Precision</InputLabel>
                  <Select labelId="presicion-label" id='location'
                          value={presicion}
                          onChange={ (e) => setPresicion(e.target.value)}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={11}>11</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid  item xs={6}>
            <FormControl style={{width: '100%'}}>
              <InputLabel id="location-label">Location</InputLabel>
              <Select labelId="location-label" id='location'
                      value={ locations.indexOf(location) }
                      onChange={ (e) => setLocation(locations[e.target.value])}>
                {locations.map((e, index) => <MenuItem value={index} key={e.listingHash}>{e.name} - {e.address}</MenuItem>) }

              </Select>
            </FormControl>
              </Grid>
              <Grid item xs={12}>
                { location && location.coords &&
                <Map style={{height: '30vh', width: '100%'}} noAreaSearch={true} presicion={[presicion]} location={{ point:location}} />}
              </Grid>

            </Grid>
            <Grid container item style={{marginTop: '15px', marginBottom: '15px'}}>
              <Grid container item xs={12} style={{height: '400px'}}>
                <Typography component='p' style={{marginLeft: '4%'}}>Description</Typography>
                <MdEditor id='description' label="Description"
                          value={description}
                          style={{width: '100%'}}
                          renderHTML={(text) => mdParser.render(text)}
                          onChange={ ({html, text}) => setDescription(text)}
                          config={{view: { menu: true, md: true, html: false }}}
                />
              </Grid>
              <div style={{ display: "flex", flexDirection: "row-reverse", marginTop: '25px', marginBottom: '25px',
                width: '100%',
                marginRight: '10%'}}>
            <Button disabled={!space} variant="contained" color="primary" onClick={onCreate}>
              Create {!space}
            </Button></div>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  </Container>)
}


export default withRouter(NewThread);