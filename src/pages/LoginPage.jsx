import React from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav, InputGroup } from 'react-bootstrap';
import { FiSearch, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi';
import { login, loginWithGoogle } from '../keycloak';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

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
      
      <SiteHeader></SiteHeader>

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

      <SiteFooter></SiteFooter>
    </div>
  );
};

export default LoginPage;
