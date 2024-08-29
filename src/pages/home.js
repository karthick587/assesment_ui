import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import actions from "../redux/auth/actions";
import VideoCall from "./videoCall";
import Conversation from "../components/home/conversation";
import Message from "../components/home/message";
import { Container, Button, Row, Col } from "react-bootstrap";

export default function Home() {
    const { user } = useSelector((state) => state.authReducer);
    const dispatch = useDispatch();

    const logOut = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userName");
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
            <Row>
                <Col md={4} className="conversation-container">
                    <Conversation />
                </Col>
                <Col md={8} className="message-container">
                    <Message />
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <VideoCall />
                </Col>
            </Row>
        </Container>
    );
}
