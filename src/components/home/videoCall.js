import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

function VideoCall() {
    const { socket, conversation } = useSelector((state) => state.authReducer);
    const [allUsers, setAllUsers] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const myVideoRef = useRef(null);
    const peerConnections = useRef({});

    useEffect(() => {
        if (conversation?._id) {
            socket.emit('join-room', conversation._id, socket.id);
            socket.on('all-users', (users) => {
                setAllUsers(users.filter(user => user.socketId !== socket.id));
            });

            socket.on('receive-offer', handleReceiveOffer);
            socket.on('receive-answer', handleReceiveAnswer);
            socket.on('receive-ice-candidate', handleReceiveIceCandidate);
            socket.on('call-ended', handleCallEnded);

            return () => {
                socket.off('receive-offer', handleReceiveOffer);
                socket.off('receive-answer', handleReceiveAnswer);
                socket.off('receive-ice-candidate', handleReceiveIceCandidate);
                socket.off('call-ended', handleCallEnded);
                endCall(); // Cleanup when the component unmounts
            }
        };
    }, [conversation, socket]);

    useEffect(() => {
        remoteStreams.forEach(stream => {
            const videoElement = document.getElementById(`remote-${stream.userId}`);
            if (videoElement && stream.stream) {
                videoElement.srcObject = stream.stream;
                playVideo(videoElement);
            }
        });
    }, [remoteStreams]);

    const playVideo = async (videoElement) => {
        try {
            await videoElement.play();
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                console.error('Autoplay is not allowed. Please interact with the page to start video playback.');
            }
        }
    };

    const initializePeerConnection = (remoteUserId) => {
        const myPeer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        myPeer.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('send-ice-candidate', {
                    candidate: event.candidate,
                    to: remoteUserId
                });
            }
        };

        myPeer.ontrack = event => {
            setRemoteStreams(prevStreams => {
                const existingStream = prevStreams.find(stream => stream.userId === remoteUserId);
                if (existingStream) {
                    return prevStreams.map(stream =>
                        stream.userId === remoteUserId
                            ? { ...stream, stream: event.streams[0] }
                            : stream
                    );
                } else {
                    return [...prevStreams, { userId: remoteUserId, stream: event.streams[0] }];
                }
            });
        };

        return myPeer;
    };

    const handleReceiveOffer = async (data) => {
        const myPeer = initializePeerConnection(data.from);
        peerConnections.current[data.from] = myPeer;
        await myPeer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        stream.getTracks().forEach(track => myPeer.addTrack(track, stream));

        if (myVideoRef.current) {
            myVideoRef.current.srcObject = stream;
            await playVideo(myVideoRef.current);
        }

        const answer = await myPeer.createAnswer();
        await myPeer.setLocalDescription(answer);
        socket.emit('send-answer', { answer, to: data.from });
    };

    const handleReceiveAnswer = async (data) => {
        await peerConnections.current[data.from].setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleReceiveIceCandidate = async (data) => {
        try {
            await peerConnections.current[data.from].addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
            console.error('Error adding received ICE candidate', e);
        }
    };

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
                await playVideo(myVideoRef.current);
            }

            allUsers.forEach(async (el) => {
                const myPeer = initializePeerConnection(el.socketId);
                peerConnections.current[el.socketId] = myPeer;
                stream.getTracks().forEach(track => myPeer.addTrack(track, stream));
                const offer = await myPeer.createOffer();
                await myPeer.setLocalDescription(offer);
                socket.emit('send-offer', { offer, to: el.socketId });
            });
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    const endCall = () => {
        Object.values(peerConnections.current).forEach(peer => peer.close());
        peerConnections.current = {};
        setRemoteStreams([]);
        setIsAudioMuted(false);
        setIsVideoMuted(false);
    };

    const handleCallEnded = () => {
        endCall();
    };

    const toggleMuteAudio = () => {
        if (myVideoRef.current && myVideoRef.current.srcObject) {
            const audioTrack = myVideoRef.current.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleMuteVideo = () => {
        if (myVideoRef.current && myVideoRef.current.srcObject) {
            const videoTrack = myVideoRef.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
            }
        }
    };

    const handleAnswerCall = () => {
        if (incomingCall) {
            startCall(incomingCall);
            setIncomingCall(null);
        }
    };

    const handleRejectCall = () => {
        if (incomingCall) {
            socket.emit('end-call', { to: incomingCall });
            setIncomingCall(null);
        }
    };

    return (
        <div className="video-call-container">
            <div className="video-calls">
                <div className="video-grid">
                    <video ref={myVideoRef} muted className="my-video" autoPlay playsInline />
                    {remoteStreams.map(stream => (
                        <video
                            key={stream.userId}
                            id={`remote-${stream.userId}`}
                            className="other-video"
                            autoPlay
                            playsInline
                        />
                    ))}
                </div>

                {incomingCall && (
                    <div className="call-notification">
                        <h2>Incoming Call from {incomingCall}</h2>
                        <button onClick={handleAnswerCall}>Answer</button>
                        <button onClick={handleRejectCall}>Reject</button>
                    </div>
                )}

                <div className="controls">
                    <button onClick={toggleMuteAudio}>
                        {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
                    </button>
                    <button onClick={toggleMuteVideo}>
                        {isVideoMuted ? "Unmute Video" : "Mute Video"}
                    </button>
                    <button onClick={() => {
                        socket.emit('end-call', { to: Object.keys(peerConnections.current) });
                        endCall();
                    }}>
                        Hang Up
                    </button>
                </div>
                <button onClick={() => startCall()}>Join Call</button>
                <div className="user-list">
                    <h2>Users</h2>
                    <ul>
                        {allUsers.map(user => (
                            <li key={user.socketId}>
                                {user.socketId}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default VideoCall;
