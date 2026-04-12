import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import './navbar.css'

function Navbarr() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary navbarr">
      <Container>
        <Navbar.Brand><h1 className='dashlogo col-sm-6'>
              <span className='F'>FC</span> <span className='A'>AI</span>
            </h1></Navbar.Brand>
        
      </Container>
    </Navbar>
  );
}

export default Navbarr;