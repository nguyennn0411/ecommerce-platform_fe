import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav, InputGroup } from 'react-bootstrap';
import { FiSearch, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi';
import { login, loginWithGoogle } from '../keycloak';

const LoginPage = ({ onAuthSuccess }) => {

  const handleLogin = async (event) => {
    event.preventDefault();
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess();
    }
    await login();
  };

  const handleGoogleLogin = async (event) => {
    event.preventDefault();
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess();
    }
    await loginWithGoogle();
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{ fontFamily: 'sans-serif' }}>
      
      {/* --- NAVBAR --- */}
      <Navbar bg="white" expand="lg" className="py-3 border-bottom px-4">
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold fs-3 text-dark">StepZone</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="mx-auto fw-semibold text-secondary" style={{ gap: '1.5rem' }}>
              <Nav.Link href="#" className="text-muted">New</Nav.Link>
              <Nav.Link href="#" className="text-muted">Sneakers</Nav.Link>
              <Nav.Link href="#" className="text-muted">Men</Nav.Link>
              <Nav.Link href="#" className="text-muted">Women</Nav.Link>
              <Nav.Link href="#" className="text-muted">Sale</Nav.Link>
              <Nav.Link href="#" className="text-muted">Collections</Nav.Link>
            </Nav>
            
            {/* Right Side Icons & Search */}
            <div className="d-flex align-items-center gap-3">
              <InputGroup size="sm" style={{ maxWidth: '200px' }}>
                <InputGroup.Text className="bg-light border-0 pr-0 text-muted">
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search..."
                  className="bg-light border-0 ps-1"
                  style={{ boxShadow: 'none' }}
                />
              </InputGroup>
              <FiHeart className="text-muted fs-5 style-pointer" style={{ cursor: 'pointer' }} />
              <FiShoppingBag className="text-muted fs-5 style-pointer" style={{ cursor: 'pointer' }} />
              <FiUser className="text-muted fs-5 style-pointer" style={{ cursor: 'pointer' }} />
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- MAIN CARD CONTAINER --- */}
      <Container className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div 
          className="bg-white shadow-sm w-100 rounded-5 overflow-hidden" 
          style={{ maxWidth: '1100px', border: '1px solid #f0f0f0' }}
        >
          <Row className="g-0 p-4 p-md-5">
            
            {/* --- LEFT SIDE: LOGIN FORM --- */}
            <Col lg={6} className="d-flex flex-column justify-content-center pe-lg-5 mb-5 mb-lg-0">
              <div className="mb-4">
                <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>Welcome Back</h1>
                <p className="text-muted">Login to continue shopping premium sneakers.</p>
              </div>

              <Form>
                {/* Email Input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold text-secondary small">Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="example@gmail.com" 
                    className="py-2.5 px-3 rounded-3"
                    style={{ borderColor: '#dcdcdc' }}
                  />
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold text-secondary small">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="••••••••••" 
                    className="py-2.5 px-3 rounded-3"
                    style={{ borderColor: '#dcdcdc' }}
                  />
                </Form.Group>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check 
                    type="checkbox" 
                    id="remember-me" 
                    label="Remember me" 
                    className="text-muted small"
                  />
                  <a href="#" className="text-dark fw-bold text-decoration-none small">Forgot password?</a>
                </div>

                {/* Submit Buttons */}
                <Button 
                  variant="dark" 
                  type="button" 
                  className="w-100 py-2.5 fw-semibold mb-3 rounded-3"
                  style={{ backgroundColor: '#111' }}
                  onClick={handleLogin}
                >
                  Login With Keycloak
                </Button>
                
                <Button
                    variant="outline-secondary"
                    type="button"
                    className="w-100 py-2.5 fw-semibold mb-4 rounded-3 text-dark border-secondary-subtle"
                    onClick={handleGoogleLogin}
                >
                  Continue with Google
                </Button>

                {/* Footer Link */}
                <div className="text-center">
                  <span className="text-muted small">Don’t have an account? </span>
                  <a href="#" className="text-muted fw-semibold small text-decoration-underline">Sign up</a>
                </div>
              </Form>
            </Col>

            {/* --- RIGHT SIDE: FEATURE BANNER --- */}
            <Col lg={6}>
              <div 
                className="w-100 h-100 rounded-4 p-5 d-flex flex-column justify-content-between position-relative text-white overflow-hidden"
                style={{ 
                  backgroundColor: '#111', 
                  minHeight: '450px' 
                }}
              >
                {/* Featured Product Image container */}
                <div className="d-flex justify-content-center align-items-center my-auto w-100">
                  <img 
                    src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop" 
                    alt="Green Sneaker" 
                    className="img-fluid rounded-4 shadow"
                    style={{ 
                      maxHeight: '220px', 
                      objectFit: 'cover',
                      width: '100%',
                      backgroundColor: '#233329' // Subtle tint to match design if image has transparency
                    }}
                  />
                </div>

                {/* Overlapping Text Content */}
                <div className="mt-4" style={{ zIndex: 2 }}>
                  <h2 className="fw-bold lh-sm m-0" style={{ fontSize: '2.8rem', letterSpacing: '-0.03em' }}>
                    New season <br /> drops are <br /> waiting.
                  </h2>
                  <p className="text-secondary-emphasis opacity-75 mt-2 mb-0 small" style={{ maxWidth: '80%' }}>
                    Sign in to save carts, track orders, and receive StepZone release notifications.
                  </p>
                </div>
              </div>
            </Col>

          </Row>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
