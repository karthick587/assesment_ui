import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import actions from "../../redux/auth/actions";
import { ListGroup, Dropdown } from "react-bootstrap";

export default function Conversation() {
    const { allUsersList, allOnlineUsers, socket, UserDetails } = useSelector((state) => state.authReducer);
    const [conversationList, setConversationList] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("getOnlineUser", (data) => {
            dispatch({ type: actions.SET_ALL_ONLINE_USERS, payload: (data || []) });
        });
        socket?.on("conversationsList", (data) => {
            setConversationList(data);
        });
    }, [socket, dispatch]);

    const getUserFromMember = (members) => {
        return members.find(el => (el._id !== UserDetails._id)) || members.find(el => (el._id === UserDetails._id));
    };

    return (
        <div className="conversation-wrapper">
            <Dropdown className="mb-3">
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    Start a New Conversation
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {allUsersList.map(el =>
                        <Dropdown.Item key={el._id} onClick={() => {
                            const members = [UserDetails._id, el._id];
                            socket.emit("createConversation", { members });
                        }}>
                            {el.UserName}
                        </Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <ListGroup variant="flush">
                {conversationList?.map(el =>
                    <ListGroup.Item
                        key={el._id}
                        action
                        onClick={() => {
                            dispatch({ type: actions.SET_CONVERSATION, payload: null })
                            dispatch({ type: actions.SET_CONVERSATION, payload: el })
                        }}
                        className="d-flex justify-content-between align-items-center"
                    >
                        <span>{getUserFromMember(el.Members)?.UserName}</span>
                        <span
                            className={`status-indicator ${allOnlineUsers?.find(e => e.user.id === getUserFromMember(el.Members)?._id) ? 'online' : 'offline'}`}>
                        </span>
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
}
