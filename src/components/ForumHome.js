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

const SUBSCRIBE_THREAD_CACHE = '/api/v0/threads/subscribe';
const MODERATOR_ADDRESS = '0xed628E601012cC6Fd57Dc0cede2A527cdc86A221';

const EntryThread = (props)  => {
  const {
    id,
    title,
    description,
    subscribe,
    thread,
    publishing,
    location
  } = props.data;
  const {goThread, joinThread, address, badges} = props;
  let badge = badges[publishing.value]
  return (
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={12} md={8} style={{textAlign: "left"}}>
          <Typography component="h3" style={{fontWeight: 'bold', fontSize: '1.2em'}}>{title}</Typography>
             <Typography style={{fontSize: '0.8em'}} component="p" > Location: {location.point.name}</Typography>
              <ReactMarkdown source={description.slice(0, 200)}/>
          </Grid>
          <Grid item xs={12} md={4}>
          <div style={{display: 'flex', justifyContent: "space-around"}}>
            { badge && publishing.policy === 'badge' &&
            <div>
              <img style={{maxWidth: 50}} src={badge.url} alt=""/><br/>
              <Typography component={'label'}>{badge.name}</Typography>
            </div>}
            <div>
              <div style={{display: 'flex', justifyContent: "space-around" }}>
                { (publishing.policy === 'points' || publishing.policy === 'badge') &&
                <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img style={{maxWidth: '35px'}} src='https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png' alt=""/>
                  { badge  && publishing.policy === 'badge' ? badge.req.points : publishing.value }
                </div>}
                {(publishing.policy === 'holding' || publishing.policy === 'badge')  &&
                <div style={{ width: '80px',display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img style={{maxWidth: '35px'}} src="https://i.ya-webdesign.com/images/game-coin-png-1.png" alt=""/>
                  {badge  && publishing.policy === 'badge' ? badge.req.holding : publishing.value }
                </div>}
                {(publishing.policy === 'challenge' || publishing.policy === 'badge') &&
                <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <img style={{maxWidth: '35px'}} src="https://i7.pngguru.com/preview/449/891/625/minecraft-diamond-sword-video-game-mob-ice-axe.jpg" alt=""/>
                  {badge && publishing.policy === 'badge' ? badge.req.challenge :  publishing.value }
                </div>
                }</div>
              <br/>
              <Typography component={'label'}>Requirements</Typography>
            </div>

          </div>
          </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{display: "flex", justifyContent: 'space-between', paddingLeft: '15px', paddingRight: '15px'}}>
          <div style={{alignText: 'left'}}>
          {location.point.coords &&
          <Typography style={{fontSize: '0.8em'}} component="p">Coords: {location.point.coords.lat}, {location.point.coords.lon}</Typography>}
          </div>
          <div>
            {location.point.coords &&
            <LinkMUI href={`https://map.foam.space/#/at/?lng=${location.point.coords.lon}&lat=${location.point.coords.lat}&zoom=${location.precision[0]}`}><Button>FOAM MAP</Button></LinkMUI>}
          <Button onClick={() => joinThread(props.data)}>Join</Button>
          </div>
        </CardActions>
      </Card>)
};

const ThreadGroup = (props) => {
  const threads = props.threads.map((thread) => (
    <EntryThread key={thread.id} data={thread} history={props.history}
                 joinThread={props.joinThread} goThread={props.goThread} address={props.address} badges={props.badges}/>
  ));
  return (<Container>
    {threads}
  </Container>)
};

const ForumHome = (props) => {
  const {
    history,
    box,
    address,
    did,
    profile,
    isReady,
    space,
    match,
    threads,
    refresh,
    badges,
  } = props;
  console.log(props)

  const goToThread = (data) => {
    history.push(`/threads/${data.id}`, {
      thread: data
    })
  };

  const subscribeThread = async (data) => {
    console.log(threads);
    try {
      if (isReady) {
        console.log(`SUBSCRIBER: ${data.thread.id}`)
        const publicThread = await space.joinThread(data.thread.id);

        let response = await axios({
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          data: JSON.stringify({
            address: address,
            thread: data.id,
          }),
          url: SUBSCRIBE_THREAD_CACHE
        });
      }
      refresh();

      goToThread(data);
    } catch (e) {
      console.log(e)
    }
  };

  return (<>
    <Typography component="h2">Threads</Typography>

    <ThreadGroup threads={threads} goThread={goToThread} joinThread={subscribeThread} address={address} badges={badges}/>
  </>)
};

export default ForumHome;