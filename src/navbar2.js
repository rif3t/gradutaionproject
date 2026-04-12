import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './navbar2.css';
import Button from 'react-bootstrap/Button';
import logoimg from './Screenshot 2026-04-09 231911.png'
import { faGauge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTie } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'



function Navbarr2() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <Navbar className="sidebar nav" bg="light" data-bs-theme="light" expand="false">
        <img className='logoimg1 col-sm-6' src={logoimg}></img>
      
      <Container className="flex-column brand">
        
        <Navbar.Brand href="/dashboard" className="mb-3"><Button className='navbtn' variant="outline-success"><FontAwesomeIcon className='dashicon' icon={faGauge} /> Dashboard</Button></Navbar.Brand>
        <Nav className="flex-column">
           <hr/>
          <Nav.Link href="/Instracpage"><Button className='navbtn' variant="outline-success"><FontAwesomeIcon className='instricon' icon={faUserTie} /> Instructor</Button></Nav.Link>
           <hr/>
          <Nav.Link href="#features"><Button className='navbtn' variant="outline-success"><FontAwesomeIcon className='settingicon' icon={faGear} /> Settings</Button></Nav.Link>
          <hr/>
          <Nav.Link href="#pricing"><Button className='navbtn' variant="outline-success">Success</Button></Nav.Link>
          <Nav.Link>
             <hr/>
            <Button className='logout' variant="danger" onClick={handleLogout}>
             <FontAwesomeIcon icon={faRightFromBracket} /> Logout
            </Button>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Navbarr2;