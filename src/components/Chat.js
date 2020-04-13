import React, { Component } from 'react';

import '../styles/index.css';
import ThreeBoxComments from "./3BoxPluginWrapper";
import {withRouter} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import {isMember} from "../libs/living";
import ReactMarkdown from "react-markdown";


const styles = {
  title: {
    fontSize: '1.2em',
    fontWeight: 'bold'
  }
}

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTopic: {},
      openTopics: {},
      threadMemberList: [],
      threadModeratorList: [],
      threadData: [],
      topicTitle: '',
      threadACError: '',
      postMsg: '',
      topicName: '',
      threadMember: '',
      threadMod: '',
      showNewTopicModal: false,
      showAddNewModeratorModal: false,
      showAddNewMemberModal: false,
      isMembersOnly: false,
      showMap: 0,
      canPost: false
    };
  }


  async componentDidMount() {
    const {
      address,
      web3,
      config
    } = this.props;
    const thread = this.props.location.state.thread
    if (!web3 || !address || !config) return;
    // 8. Validate if the user can post to the current thread
    const eventContract = config.eventContract(thread.address);
    const canPost = await isMember(eventContract, address, config);
    if (canPost !== this.state.canPost) {
      this.setState({
        canPost
      });
    }
  }

  async componentWillUpdate() {
    const {
      address,
      web3,
      config,
    } = this.props;
    const thread = this.props.location.state.thread
    if (!web3 || !address || !config) return;

    const eventContract = config.eventContract(thread.address);
    const canPost = await isMember(eventContract, address, config);

    if (canPost !== this.state.canPost) {
      this.setState({
        canPost
      });
    }
  }

  render() {
    const {
      address,
      box,
      profile,
      space,
      history,
      config,
    } = this.props;

    if (this.props.location.state === undefined) {
      history.push('/')
      return <></>
    }

    const thread = this.props.location.state.thread
    console.log(`CHAT: ${thread.address}`);

    return (
      <>
        <Grid container justify='center'>
          <Grid item xs={8} style={{paddingLeft: '10px', paddingRight: '10px',}}>
            <Card>
              <CardContent style={{textAlign: "left", paddingLeft: '5%', paddingRight: '5%'}}>
                <Typography component="h1" style={styles.title}>{thread.name}</Typography>
                { thread.description ? <ReactMarkdown source={thread.description}/> : ''}
              </CardContent>
            </Card>
            {space && space._name &&
            <Grid container  style={{marginTop: '20px'}}>
              <Card>
                <CardContent style={{paddingRight: '15px', paddingLeft: '15px'}}>
                  {/*
                    9. Use Custom Box comment, this allow validate if the current user can post to the thread
                  */}
                  <ThreeBoxComments
                    // Required
                    spaceName={config.spaceName}
                    threadName={thread.address}
                    adminEthAddr={thread.admin}
                    firstModerator={thread.admin}
                    space={space}

                    // Required props for context A) & B)
                    box={box}
                    currentUserAddr={address}
                    canPost={() => this.state.canPost}

                    // optional
                    members={false}
                    showCommentCount={10}
                    useHovers={false}
                    currentUser3BoxProfile={profile}
                    userProfileURL={address => `https://mywebsite.com/user/${address}`}
                  />
                </CardContent>
              </Card>
            </Grid>}
          </Grid>
        </Grid>
      </>
    );
  }
}
export default withRouter(Chat);