import { Nav } from "react-bootstrap";

function DashboardSidebar() {
    return (
        <div 
            className="d-flex flex-column p-3 bg-light" 
            style={{ width: '250px', minHeight: '100vh' }}
            >
            <p className="d-flex align-items-center mb-3 text-dark text-decoration-none fs-4 fw-bold">
                Dashboard
            </p>
            <hr />
            <Nav className="flex-column nav-pills">
                <Nav.Link href='"dashboard/product' className="text-dark">
                    Product
                </Nav.Link>
                <Nav.Link href="/" className="text-dark">
                    Back to Homepage
                </Nav.Link>
            </Nav>
        </div>
    );
}

export default DashboardSidebar;