import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import actions from '../../redux/auth/actions';
import VideoCall from './videoCall';

export default function Message() {
    const { allOnlineUsers, socket, UserDetails, conversation, videoCall } = useSelector((state) => state.authReducer);
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [textMessage, setTextMessage] = useState("");
    const dispatch = useDispatch();
    useEffect(() => {
        socket?.on("messagesList", (data) => {
            setMessages(data);
        });
    }, []);
    useEffect(() => {
        if (conversation?._id) {
            socket?.on(`typing${conversation._id}`, (data) => {
                if (data.ConversationId === conversation._id) {
                    setTyping(data.typing);
                }
            });

            socket?.on(`receiveMessage${conversation._id}`, (data) => {
                if (data.ConversationId === conversation._id) {
                    setMessages((prev) => [...prev, data]);
                }
            });

            socket?.on(`messageReadUpdate${conversation._id}`, (data) => {
                if (data.ConversationId === conversation._id) {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg._id === data._id ? { ...msg, readBy: data.readBy } : msg
                        )
                    );
                }
            });

            return () => {
                socket.off(`typing${conversation._id}`);
                socket.off(`receiveMessage${conversation._id}`);
                socket.off(`messageReadUpdate${conversation._id}`);
            };
        }
    }, [conversation, socket]);

    useEffect(() => {
        if (conversation?._id) {
            socket?.emit("getMessages", conversation?._id);
        }
    }, [conversation, socket]);


    useEffect(() => {
        if (conversation._id && UserDetails._id) {
            // When messages are received or when the conversation changes, mark them as read
            messages.forEach(message => {
                if (!message?.readBy?.includes(UserDetails._id)) {
                    socket.emit("messageRead", { messageId: message._id, userId: UserDetails._id });
                }
            });
        }
    }, [messages, conversation, socket, UserDetails]);

    const getUserFromMember = (members) => {
        return members.find(el => (el._id !== UserDetails._id)) || members.find(el => (el._id === UserDetails._id));
    };
    return (
        <div className="message-area  p-3 bg-light rounded">
            <div className='d-flex w-100 justify-content-between mb-3'>
                <div>
                    Chat
                </div>
                <div>
                    {videoCall ? <button onClick={() => dispatch({ type: actions.SET_VIDEO_CALL, payload: false })}>Off Video Call</button> : <button onClick={() => dispatch({ type: actions.SET_VIDEO_CALL, payload: true })}>On Video Call</button>}
                </div>
            </div>
            {videoCall && <VideoCall />}
            <Fragment>
                <div className="message-list overflow-auto mb-3">
                    {messages?.map(el =>
                        <div
                            key={el._id}
                            className={`message-item p-2 mb-2 ${el.sentBy === UserDetails._id ? 'text-end bg-primary text-white' : 'bg-white'}`}
                        >
                            <p className="mb-0">{el.text}</p>
                            {el?.readBy?.length >= conversation?.Members?.length && el?.sentBy === UserDetails._id &&
                                <small className="text-muted">Read</small>}
                        </div>
                    )}

                </div>
                <div className="typing-indicator mb-2">
                    {typing && <small className="text-success">Typing...</small>}
                </div>
                <div className="d-flex">
                    <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={textMessage}
                        onFocus={() => {
                            let user = allOnlineUsers.find(v => v?.user?.id === getUserFromMember(conversation?.Members)?._id);
                            if (user) {
                                socket.emit("onTyping", { socketId: user.socketId, data: { ConversationId: conversation._id, typing: true } });
                            }
                        }}
                        onBlur={() => {
                            let user = allOnlineUsers.find(v => v?.user?.id === getUserFromMember(conversation?.Members)?._id);
                            if (user) {
                                socket.emit("onTyping", { socketId: user.socketId, data: { ConversationId: conversation._id, typing: false } });
                            }
                        }}
                        onChange={(e) => setTextMessage(e.target.value)}
                        className="me-2"
                    />
                    <Button
                        variant="primary"
                        disabled={!textMessage}
                        onClick={() => {
                            socket.emit("sendMessage", {
                                ConversationId: conversation._id,
                                sentBy: UserDetails?._id,
                                text: textMessage,
                            });
                            setTextMessage("")
                        }}
                    >
                        Send
                    </Button>
                </div>
            </Fragment>
        </div>
    );
}
