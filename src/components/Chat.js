import React, { Component } from 'react';

import '../styles/index.css';
import ThreeBoxComments from "../libs/3box-comments-react/src/index";
import {withRouter} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import {isMember} from "../libs/living";


const canPost = () => {
  console.log('No allowed to post')
  return true;
};


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
    if (!web3 || !address || !thread.abi) return;
    console.log(this.props)

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
    if (config) return;
    console.log(this.props)

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
    console.log(this.props.location.state.thread);


    return (
      <>
        <Grid container>
          <Grid item xs={12} md={4} style={{paddingLeft: '10px', paddingRight: '10px',}}>
            <Card>
              <CardContent>
                <Typography component="h1" style={styles.title}>{thread.name}</Typography>
              </CardContent>
            </Card>
            {space && space._name &&
            <Grid container  style={{marginTop: '20px'}}>
              <Card>
                <CardContent style={{paddingRight: '15px', paddingLeft: '15px'}}>
                  <ThreeBoxComments
                    // required
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