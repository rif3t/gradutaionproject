import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './Setting.css'
import { Col, Container, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';
function Setting() {
    const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  useEffect(() => {
    setAdminName(localStorage.getItem('adminName') || '');
    setAdminEmail(localStorage.getItem('adminEmail') || '');
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const newName = e.target.adminName.value;
    const newEmail = e.target.adminEmail.value;
    
    localStorage.setItem('adminName', newName);
    localStorage.setItem('adminEmail', newEmail);
    
    setAdminName(newName);
    setAdminEmail(newEmail);
    
    alert('Profile updated successfully!');
  };
  return (
    <>
    <div className='settingcontent'>
         <h3 className="dashtext">Settings</h3>
        <Container>
            <Row>
                <Col lg={6}>
        <Card className='settingcards' >
      <Card.Body>
        <Card.Title>QR Settings</Card.Title>
       <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>QR Refresh Interval (seconds)</Form.Label>
        <Form.Control type="number" placeholder="0 (sec)" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>QR Token Expiry (seconds)</Form.Label>
        <Form.Control type="number" placeholder="0 (sec)" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicCheckbox">
      </Form.Group>
      <Button className='settingbtn' variant="outline-success" type="submit">
        Save QR Settings
      </Button>
    </Form>
      </Card.Body>
    </Card>
    </Col>
    <Col lg={6}>
        <Card className='settingcards' >
      <Card.Body>
        <Card.Title>Location Validation</Card.Title>
        <Form>
      <fieldset>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="disabledSelect">Enable GPS Validation</Form.Label>
          <Form.Select id="disabledSelect">
            <option>Enabled</option>
            <option>Disabled</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Allowed Radius (meters)</Form.Label>
        <Form.Control type="number" placeholder="meters" />
      </Form.Group>
        <Form.Group className="mb-3">
        </Form.Group>
        <Button className='settingbtn'variant="outline-success"  type="submit">Save Location Settings</Button>
      </fieldset>
    </Form>
      </Card.Body>
    </Card>
    </Col>
    <Col lg={6}>
        <Card className='settingcards' >
      <Card.Body>
        <Card.Title>Admin Account</Card.Title>
         <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Admin Name</Form.Label>
        <Form.Control type="text" name="adminName"  defaultValue={adminName} placeholder="Enter email" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Admin Email</Form.Label>
        <Form.Control type="email"  name="adminEmail" defaultValue={adminEmail} placeholder=""  />
      </Form.Group>
      <Button className='settingbtn' variant="outline-success" type="submit">
        Update Profile
      </Button>
    </Form>
      </Card.Body>
    </Card>
    </Col>
    <Col lg={6}>
        <Card className='settingcards' >
      <Card.Body>
        <Card.Title>Change Password</Card.Title>
      <Form>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>New Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Button className='settingbtn' variant="outline-success" type="submit">
        Change Password
      </Button>
    </Form>
      </Card.Body>
    </Card>
    </Col>
    
    </Row>
    </Container>
    </div>
    </>
  );
}

export default Setting;