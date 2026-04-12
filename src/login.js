import Card from 'react-bootstrap/Card';
import image1 from "./Screenshot 2026-04-09 231911.png"
import "./login.css"
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from './auth';
import { useNavigate } from "react-router-dom";

function Loginpage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login success:", data);
      // هنا تقدر تخزن التوكن
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    },
    onError: (error) => {
      console.log("Login error:", error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = e.target.formBasicEmail.value;
    const password = e.target.formBasicPassword.value;

    mutation.mutate({ email, password });
  };

  return (
    <div className="container body col-md-12">
        
      <Card className='container border-0 logocard1 col-sm-6'>
        <Card.Body className='cardbody'>

          <Card.Title>
            <h1 className='logoname'>
              <span className='F'>FC</span> <span className='A'>AI</span>
            </h1>
          </Card.Title>

          <Card.Text className='logotext'>
            FCAI Attendance
          </Card.Text>
        
          <Form className='form' onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className='email'>Email</Form.Label>
              <Form.Control
                className='username'
                type="email"
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                className='password'
                type="password"
                placeholder="Password"
                required
              />
            </Form.Group>

            <Button
              className='loginbtn'
              variant="info"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </Button>

            {mutation.isError && (
              <p style={{ color: "red", marginTop: "10px" }}>
                {mutation.error.message}
              </p>
            )}

          </Form>

        </Card.Body>
      </Card>

      <Card className='container border-0 logocard2 col-md-6 cardbody'>
        <Card.Img
          variant="right"
          src={image1}
          className='container logoimage'
        />
            <h1 className='logoname2'>
              <span className='F'>FC</span> <span className='A'>AI</span>
            </h1>
         
      </Card>

    </div>
  );
}

export default Loginpage;