import Typography from "@material-ui/core/Typography";
import React, {useEffect, useState} from "react";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid";
import {getUniqueAddress, joinThread} from "../libs/living";
import ReactMarkdown from "react-markdown";

const EntryThread = (props)  => {
  const {
    name,
    description,
  } = props.data;
  const {joinThread} = props;

  return (
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={12} style={{textAlign: "left", paddingLeft: '5%', paddingRight: '5%'}}>
              <Typography component="h3" style={{fontWeight: 'bold', fontSize: '1.2em'}}>{name}</Typography>
              <div>
              { description ? <ReactMarkdown source={description.slice(0, 310)}/> : ''}
              </div>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{display: "flex", justifyContent: 'space-between', paddingLeft: '15px', paddingRight: '15px'}}>
          <div style={{alignText: 'left', paddingLeft: '5%', paddingRight: '5%'}}>
            <Button onClick={() => joinThread(props.data)}>Join</Button>
          </div>
        </CardActions>
      </Card>)
};

const ThreadGroup = (props) => {
  const threads = props.threads.map((thread) => (
    <EntryThread key={thread.address} data={thread.data} history={props.history} joinThread={props.joinThread}  />
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
    space,
    config,
  } = props;

  const goToThread = (data) => {
    history.push(`/threads/${data.id}`, {
      thread: data
    })
  };

  const subscribeThread = async (data) => {
    try {
      const PartyContract = config.eventContract(data.address)
      const addresses = await window.ethereum.enable();
      const currentUserAddr = addresses[0];
      const thread = await joinThread(PartyContract, currentUserAddr, data.address, space, data.admin, config);

      if (thread) {
        console.log('========== Address')
        console.log(await getUniqueAddress(thread))
      }

      goToThread(data)
    } catch (e) {
      console.log(e)
    }
  }

  return (<>
    <Typography component="h2">Threads</Typography>
    <ThreadGroup threads={threads} goThread={goToThread} joinThread={subscribeThread} address={address}/>
  </>)

}

export default Living;