import Typography from "@material-ui/core/Typography";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import LinkMUI from '@material-ui/core/Link';
import * as axios from "axios";
import Grid from "@material-ui/core/Grid";
import ReactMarkdown from "react-markdown";
import {getPartyContract, getUniqueAddress, joinThread} from "../libs/living";
import Box from '3box';

const EntryThread = (props)  => {
  const {
    id,
    name,
    description,
  } = props.data;
  const {joinThread} = props;

  return (
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={12} md={8} style={{textAlign: "left"}}>
              <Typography component="h3" style={{fontWeight: 'bold', fontSize: '1.2em'}}>{name}</Typography>
              <Typography style={{fontSize: '0.8em'}} component="p" > Location: {description}</Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{display: "flex", justifyContent: 'space-between', paddingLeft: '15px', paddingRight: '15px'}}>
          <div style={{alignText: 'left'}}>
            <Button onClick={() => joinThread(props.data)}>Join</Button>
          </div>
        </CardActions>
      </Card>)
};

const ThreadGroup = (props) => {
  const threads = props.threads.map((thread) => (
    <EntryThread key={thread.address} data={thread.data} history={props.history}
                 joinThread={props.joinThread} goThread={props.goThread} />
  ));
  return (<Container>
    {threads}
  </Container>)
};

const Living = (props) => {
  const {
    history,
    address,
    isReady,
    threads,
    web3,
    space,
    box,
    profile,
    config,
  } = props;

  const goToThread = (data) => {
    history.push(`/threads/${data.id}`, {
      thread: data
    })
  };

  const subscribeThread = async (data) => {
    console.log(data)
//    try {

        console.log(`SUBSCRIBER: ${data.address}`)
        const PartyContract = config.eventContract(data.address)
        const addresses = await window.ethereum.enable();
        const currentUserAddr = addresses[0];
        // contract, address, name, space, adminAddress

        const thread = await joinThread(PartyContract, currentUserAddr, data.address, space, data.admin, config);
        if (thread) {
          console.log('========== Address')
          console.log(await getUniqueAddress(thread))
        }

        // const publicThread = await space.joinThread(data.thread.id);

        goToThread(data)
      // goToThread(data);
    //} catch (e) {
    //  console.log(e)
   // }
  };

  return (<>
    <Typography component="h2">Threads</Typography>

    <ThreadGroup threads={threads} goThread={goToThread} joinThread={subscribeThread} address={address}/>
  </>)
};

export default Living;