import React, { useState,useRef } from 'react';
import ReactDOM from "react-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import Button from '@material-ui/core/Button/Button';
import { rtc , options} from './context/constant';
import "./App.css";


function App() {
  const handleJoin = async () => {
    try{
    console.log("Joining")
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
    const uid = await rtc.client.join(options.appId, options.channel, options.token, null);
    
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

  return(
    <div>
      <div>
        <Button color="primary" onClick={handleJoin}>Join</Button>
        <Button color="primary" onClick={handleLeave}>Leave</Button>
      </div>
      <>
        <div id="local-stream" className="stream local-stream"></div>
          <div
            id="remote-stream"
            className="stream remote-stream"
        ></div>
        </>
    </div>
  )
}

export default App;
