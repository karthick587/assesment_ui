import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';

export default function Message() {
    const { allOnlineUsers, socket, UserDetails, conversation } = useSelector((state) => state.authReducer);
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [textMessage, setTextMessage] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("messagesList", (data) => {
            setMessages(data);
        });
        socket?.on("receiveMessage", (data) => {
            setMessages(prev => [...prev, data]);
        });
        socket?.on("messageSent", (data) => {
            setTextMessage("");
            setMessages(prev => [...prev, data]);
        });
        socket?.on("typing", (data) => {
            if (data.ConversationId === conversation?._id) {
                setTyping(data.typing);
            }
        });
    }, []);

    useEffect(() => {
        if (conversation?._id) {
            socket?.emit("getMessages", conversation?._id);
        }
    }, [conversation]);

    const getUserFromMember = (members) => {
        return members.find(el => (el._id !== UserDetails._id)) || members.find(el => (el._id === UserDetails._id));
    };

    return (
        <div className="message-area p-3 bg-light rounded">
            <div className="message-list overflow-auto mb-3">
                {messages?.map(el =>
                    <div
                        key={el._id}
                        className={`message-item p-2 mb-2 ${el.sentBy === UserDetails._id ? 'text-end bg-primary text-white' : 'bg-white'}`}
                    >
                        <p className="mb-0">{el.text}</p>
                    </div>
                )}
            </div>
            <div className="typing-indicator mb-2">
                {typing && <small className="text-success">Typing...</small>}
            </div>
            <Form.Group className="d-flex">
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
                    }}
                >
                    Send
                </Button>
            </Form.Group>
        </div>
    );
}
