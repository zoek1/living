import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Switch,
  Route,
  withRouter, Link
} from 'react-router-dom';
import Box from '3box';
import Login from "./components/Login";
import Chat from "./components/Chat";
import NewThread from "./components/NewThread";
import CssBaseline from "@material-ui/core/CssBaseline";
import ForumHome from "./components/ForumHome";
import * as axios from "axios";
import {getListings} from "./libs/foam";

import Button from "@material-ui/core/Button";
import mapboxgl from 'mapbox-gl';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import makeBlockie from "ethereum-blockies-base64";
import {shortenEthAddr} from "./libs/3box-comments-react/src/utils";
import CircularProgress from "@material-ui/core/CircularProgress";
import {latest} from "mapbox-gl/dist/style-spec/index.es";
import {
  DeployerAddress,
  getDeployerContract,
  getEvents,
  initMoloch,
  initWearerKickback, MolochAddress,
  openBox,
  openSpace
} from "./libs/living";
import Living from "./components/Living";
const Web3 = require('web3')

const firey = require('./assets/firey.png');
const DeployerJSON =  require('./abis/Deployer.json');
const PartyJSON = require('./abis/Party.json');

const BOX_SPACE = 'firey';
const LIST_THREADS_CACHE = '/api/v0/threads/';

function App(props) {
  const {history} = props;
  const [box, setBox] = useState( null);
  const [chatSpace, setChatSpace] = useState({});
  const [currentAddress, setAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [currentDid, setDid] = useState('');
  const [profile, setProfile] = useState({});
  const [isAppReady, setAppReady] = useState(false);
  const [disableLogin, setDisableLogin] =  useState(false);
  const [threads, setThreads] = useState([]);
  const [config, setConfig] = useState(null)
  const eventChats = async () => {
    const web3 = new Web3(window.web3.currentProvider || 'https://mainnet.infura.io/v3/f1c6706dd83740aba51f22b053cb6759');
    setWeb3(web3);

    const molochContractAddress = MolochAddress["0"]
    const deployerContractAddress = DeployerAddress[0];
    const name = 'local/living';

    // const configurator = initMoloch(web3, molochContractAddress, name);
    const configurator = initWearerKickback(web3, deployerContractAddress, name);
    setConfig(configurator);

    const events = await getEvents(configurator, 4);

    setThreads(events)

    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.enable();
      let address = await web3.eth.getAccounts()
      const profile = await Box.getProfile(address[0]);
      setAddress(address[0]);
      console.log(profile)
      setProfile(profile);
      const box = await openBox(window.ethereum)
      await box.syncDone;
      setBox(box);

      const space = await openSpace(name, box);
      console.log(space)
      setChatSpace(space)
    }


    /*
    const events = contract.getPastEvents('NewParty', {fromBlock: 0, to: 'latest'}, async (err, events) => {
      if (err) {
        console.log(err);
      }
      console.log(events)
      for (let i=0; i<events.length; i++) {
        const PartyAddress = events[i].returnValues.deployedAddress;
        const Party = new web3.eth.Contract(PartyJSON, PartyAddress);
        const name = await Party.methods.name().call();

        const getInfo = await fetch('https://live.api.kickback.events/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "operationName":"getParty",
            "variables": {
              "address": PartyAddress
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
        const data = await getInfo.json();
        console.log(`${PartyAddress}: ${name}`)
        console.log(data)
      }
    })
     */
  }


  const handleLogin = async () => {
    await window.ethereum.enable();
    setDisableLogin(true);
    //const web3 = new Web3(window.web3.currentProvider || "ws://localhost:8545");
    //let address = await web3.eth.getAccounts()

    //const profile = await Box.getProfile(address[0]);
    //const box = await Box.openBox(address[0], window.ethereum, {})

    //await box.syncDone;

    //const chatSpace = await box.openSpace(BOX_SPACE);
    //const Did = chatSpace.DID;

    //setAddress(address[0]);
    //setProfile(profile);
    //setBox(box);
    //setDid(Did);
    //console.log(Did)
    //setChatSpace(chatSpace);
    setAppReady(true);
    window.localStorage.setItem('logged', true)

    //history.push('/home');
  };

  useEffect(() => {
    eventChats()
    // forceRefresh().then(() => console.log('updated data')).catch((e) => console.log(e))
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('logged')) {
      handleLogin()
    }
  }, [])
  const updatedProfilePicture = profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
    : currentAddress && makeBlockie(currentAddress);

  return (
    <div className="App">
      <AppBar position="static" style={{marginBottom: '15px', backgroundColor: '#C20530'}}>
        <Container>
        <Toolbar style={{justifyContent: 'space-between', display: 'flex'}}>
          <Link to='/'>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <img src={firey} style={{    minWidth: '56px',
              minHeight: '56px',
              maxWidth: '56px',
              maxHeight: '56px'}} alt=""/>
          <Typography style={{color: "white"}} variant="h6">
            Firey
          </Typography> </div></Link>
          <div style={{display: 'flex'}}>
            <Link to='/'><Button style={{color: "white"}}>Home</Button></Link>
            {!disableLogin && <Button style={{color: "white"}} onClick={handleLogin}>Login</Button> }

          { disableLogin && !isAppReady &&<div style={{display: 'flex', alignItems: 'center'}}>
          <CircularProgress style={{color: 'white'}} color="primary" /> Loading Profile...
          </div>}
          {isAppReady &&
            <Link to='/threads/new'><Button style={{color: "white"}}>New thread</Button></Link>
          }
          { Object.keys(profile).length !== 0 && <div style={{display: 'flex', alignItems: 'center'}}>
              <img src={updatedProfilePicture} alt="Profile" className="input_user" style={{position: 'initial'}}/>
              {profile.name || shortenEthAddr(currentAddress)}
            </div>
          }
          </div>

        </Toolbar>
        </Container>
      </AppBar>


      <CssBaseline />
      <React.Fragment>
        <Switch>
          <Route
            exact
            path={'/threads/new'}
            render={() => (
              <NewThread
                space={chatSpace}
                profile={profile}
                address={currentAddress}
                did={currentDid}
                isReady={isAppReady}
              />
            )}
          />
          <Route
            exact
            path={'/threads/:threadId'}
            render={() => (
              <Chat
                space={chatSpace}
                profile={profile}
                address={currentAddress}
                isReady={isAppReady}
                box={box}
                web3={web3}
                config={config}
              />
            )}
          />

          <Route
            exact
            path='/'
            render={() => <Living
              history={history}
              address={currentAddress}
              isReady={isAppReady}
              threads={threads}
              space={chatSpace}
              web3={web3}
              box={box}
              config={config}
            />}
          />

        </Switch>
      </React.Fragment>
    </div>
  );
}

export default withRouter(App);