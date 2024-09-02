import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/auth/actions";
import VideoCall from "../components/home/videoCall";
import Conversation from "../components/home/conversation";
import Message from "../components/home/message";
import { Container, Button, Row, Col } from "react-bootstrap";

export default function Home() {
    const { user, conversation } = useSelector((state) => state.authReducer);
    const dispatch = useDispatch();

    const logOut = () => {
        localStorage.clear();
        dispatch({ type: actions.RESET });
    };

    useEffect(() => {
        dispatch({ type: actions.GET_ALL_USERS });
    }, [dispatch]);

    return (
        <Container fluid className="home-container p-4">
            <Row className="justify-content-between align-items-center mb-4">
                <Col>
                    <h1 className="text-primary">Welcome, {user?.name}</h1>
                </Col>
                <Col className="text-end">
                    <Button variant="danger" onClick={logOut}>
                        Log Out
                    </Button>
                </Col>
            </Row>
            <Row className="h-84vh">
                <Col md={4} className="conversation-container">
                    <Conversation />
                </Col>
                <Col md={8} className="message-container">
                    {conversation?._id && <Message />}
                </Col>
            </Row>
        </Container>
    );
}
