import { Col, Form, Row, Table } from "react-bootstrap";
import { getCurrentProfile } from "../keycloak";

function UserProfile() {
    const profile = getCurrentProfile();

    return(
        <div className="container">
            <h1>Hồ sơ người dùng</h1>
            <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Username</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" readOnly defaultValue={profile.username} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Email</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" readOnly defaultValue={profile.email} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">First name</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" readOnly defaultValue={profile.firstName} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Last name</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" readOnly defaultValue={profile.lastName} />
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );
}

export default UserProfile;