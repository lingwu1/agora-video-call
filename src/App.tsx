import React, { useState,useRef } from 'react';
import ReactDOM from "react-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import Button from '@material-ui/core/Button/Button';
import { rtc , options} from './context/constant';
import "./App.css";
import { AppBar, makeStyles, TextField, Toolbar, Typography } from '@material-ui/core';


function App() {
  const handleJoin = async () => {
    try{
      setJoin(true);
    console.log("Joining")
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

    const uid = await rtc.client.join(values.appId, values.channel, values.token, null);
    
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    rtc.localVideoTrack.play("local-stream");

    rtc.client.on("user-published", async (user: any, mediaType:any) => {
      await rtc.client.subscribe(user,mediaType);
      console.log("subscribe success",mediaType);
      console.log("user",user)
    
      if (mediaType === "video") {

        const remoteVideoTrack = user.videoTrack;
        console.log(remoteVideoTrack);
        
        const PlayerContainer = React.createElement("div", {
          id: user.uid,
          className: "stream",
        });
        ReactDOM.render(
          PlayerContainer,
          document.getElementById("remote-stream")
        );

        user.videoTrack.play(`${user.uid}`);
  
      }
    
      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
    });

    rtc.client.on("user-unpublished", (user:any) => {
      const playerContainer:any = document.getElementById(user.uid);
      playerContainer.remove();
    });

    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("publish success!");
    }catch(err){
      console.error(err)
    }
  }

  const handleLeave = async () => {
    try{
      setJoin(false)
      const localContainer:any = document.getElementById("local-stream");

      localContainer.textContent = "";

      rtc.localAudioTrack.close();
      rtc.localVideoTrack.close();
    
      rtc.client.remoteUsers.forEach((user:any) => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
      });
  
      await rtc.client.leave();
    }catch(err){
      console.error(err);
    }
  }

  const useStyles = makeStyles({
    root: {
        border: 0,
        borderRadius: 0,
        backgroundColor: '#3f51b5',
        color: 'white',
        width: "250px",
        marginTop: "30px"
    },
});

const classes = useStyles(); 

const useStyles2 = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '50ch',
    },
  },
}));

const classes2 = useStyles2();
const [values, setValues] = React.useState({
  appId: '',
  channel: '',
  token: ''
});
const [join,setJoin] = useState(false);

const handleChangeForm = (name:any) => (event:any) => {
  setValues({ ...values, [name]: event.target.value });
};

  return(
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography>Agora Video Call</Typography>
        </Toolbar>
      </AppBar>
      <div className="in-middle">
        {join?
           <div> 
              <div className="stream-display">
                  <div id="local-stream" className="stream local-stream"></div>
                  <div id="remote-stream" className="stream remote-stream"></div>
              </div>
              <Button variant="contained" className={classes.root} onClick={handleLeave}>Leave Channel</Button>
              <div/></div> :         
              <div>
                <div>
                  <h4 className="pd-tp">Join a channel with <b>appId</b></h4>
                  <img className="video-img" src="/meeting.png" alt="video"></img>
                  </div>
                  <form className={classes2.root} noValidate autoComplete="no">
                    <TextField id="standard-basic" value={values.appId} onChange={handleChangeForm("appId")} label="appId" />
                      <TextField id="standard-basic" value={values.channel} onChange={handleChangeForm("channel")} label="channel name" />
                      <TextField id="standard-basic" value={values.token} onChange={handleChangeForm("token")} label="token" />
                    </form>
                  <Button variant="contained" className={classes.root} onClick={handleJoin}>Join Channel</Button>
                  </div>
        }
    </div>
  </div>
  )
}

export default App;
