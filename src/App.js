import React, {useEffect, useState} from 'react';
import './App.css';
import {
  Switch,
  Route,
  withRouter, Link
} from 'react-router-dom';
import Box from '3box';
import Chat from "./components/Chat";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import makeBlockie from "ethereum-blockies-base64";
import {shortenEthAddr} from "3box-comments-react/lib/utils";
import CircularProgress from "@material-ui/core/CircularProgress";

import {
  DeployerAddress, getDeployerContract,
  getEvents, getPartyContract,
  initMoloch,
  initWearerKickback,
  MolochAddress,
  openBox,
  openSpace, populateEvents
} from "./libs/living";
import Living from "./components/Living";
const Web3 = require('web3')

const logo = require('./assets/logo.png');

function App(props) {
  const {history} = props;
  const [box, setBox] = useState( null);
  const [chatSpace, setChatSpace] = useState({});
  const [currentAddress, setAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [profile, setProfile] = useState({});
  const [isAppReady, setAppReady] = useState(false);
  const [disableLogin, setDisableLogin] =  useState(false);
  const [threads, setThreads] = useState([]);
  const [config, setConfig] = useState(null)


  const handleLogin = async () => {
    setDisableLogin(true);
    // 1. Setup web3 to retrieve 3box thread and profiles
    const web3 = new Web3(window.web3.currentProvider || 'https://mainnet.infura.io/v3/f1c6706dd83740aba51f22b053cb6759');
    setWeb3(web3);

    // 2. Set the network and the space name. The posts and comments will depend on this configurations
    //    due such elements reside on given space and network
    const molochContractAddress = MolochAddress["0"]
    const deployerContractAddress = DeployerAddress[0];
    const name = 'local/living';

    /* 3. Get the configurations to interact witht the given events provider
        Here the contracts, connections and mappers are populated

        {
          mainContract: Emitter of the events,
          eventContract: Allows us to know the admin, if the user is member and details,
          searchEvent:  Configure the event to query on the `mainContract` like 'NewParty',
          isMember: Configure the method name to check if the user is member like 'isRegistered',
          spaceName: Configure where the chats will be stored,
          populate: Allow structure event into required structure and add additional info,
            Required structure {
               'address': Identify the address of the contract
               'data': {
                 address: Identify the event
                 id: Identify the event
                 admin: Indicate who needs to create the chat for each event

                 // Only required in this demo
                 name
                 description
               },
          }
          memberPredicate: Allow customize the isMember in case the output of `isMember` call isn't a boolean type
        }
    */
    //const configurator = initMoloch(web3, molochContractAddress, name);
    const configurator = initWearerKickback(web3, deployerContractAddress, name);
    setConfig(configurator);

    // 4. Based on previous configurations, retrieve the parties or proposals
    const events = await getEvents(configurator, 20);

    // 5. Go to Living.js
    setThreads(events)

    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.enable();
      const address = await web3.eth.getAccounts()
      const profile = await Box.getProfile(address[0]);

      setAddress(address[0]);
      setProfile(profile);

      const box = await openBox(window.ethereum)
      await box.syncDone;
      setBox(box);

      const space = await openSpace(name, box);

      setChatSpace(space)
    }
    setAppReady(true);
    window.localStorage.setItem('logged', true)
  };

  useEffect(() => {
    if (window.localStorage.getItem('logged')) {
      handleLogin()
    }
  }, [])

  const updatedProfilePicture = profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
    : currentAddress && makeBlockie(currentAddress);

  return (
    <div className="App">
      <AppBar position="static" style={{marginBottom: '15px', backgroundColor: '#FAFAFA'}}>
        <Container>
        <Toolbar style={{justifyContent: 'space-between', display: 'flex'}}>
          <Link to='/'>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <img src={logo} style={{    minWidth: '56px',
              minHeight: '56px',
              maxWidth: '56px',
              maxHeight: '56px',
              marginRight: '15px'
            }} alt=""/>
          <Typography style={{color: "black"}} variant="h6">
            Living
          </Typography> </div></Link>
          <div style={{display: 'flex'}}>
            <Link to='/'><Button style={{color: "black"}}>Home</Button></Link>
            {!disableLogin && <Button style={{color: "black"}} onClick={handleLogin}>Login</Button> }

          { disableLogin && !isAppReady &&<div style={{display: 'flex', alignItems: 'center', color: '#333'}}>
          <CircularProgress style={{color: 'black'}} color="primary" /> Loading Profile...
          </div>}
          { Object.keys(profile).length !== 0 && <div style={{display: 'flex', alignItems: 'center', color: 'black'}}>
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
