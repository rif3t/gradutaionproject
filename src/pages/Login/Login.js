import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";  // ✅ شيل data و Navigate
import { loginUser } from "../../services/auth";
import logoImage from "../../assets/images/logo.png";
import "./Login.css";

function LoginPage() {
  const navigate = useNavigate();  // ✅ c صغير

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminName", data.user?.fullName || "Admin");
      localStorage.setItem("adminEmail", data.user?.email || "");
      localStorage.setItem("adminRole", data.user?.role || "");

      const userRole = data.user?.role?.toLowerCase();
 if (userRole === "admin") {
        navigate("/dashboard");
      } 
      else if (userRole === "instructor") {
        navigate("/instructor-dashboard");
      }
      else {
        navigate("/unauthorized");
      }
    },
    onError: (error) => {
      console.log("login error", error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.formBasicEmail.value;
    const password = e.target.formBasicPassword.value;
    mutation.mutate({ email, password });
  };

  return (
    <div className="container body col-md-12">
      <Card className="container border-0 logocard1 col-sm-6">
        <Card.Body className="cardbody">
          <Card.Title>
            <h1 className="logoname">
              <span className="F">FC</span> <span className="A">AI</span>
            </h1>
          </Card.Title>

          <Card.Text className="logotext">FCAI Attendance</Card.Text>

          <Form className="form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="email">Email</Form.Label>
              <Form.Control
                className="username"
                type="email"
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                className="password"
                type="password"
                placeholder="Password"
                required
              />
            </Form.Group>

            <Button
              className="loginbtn"
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

      <Card className="container border-0 logocard2 col-md-6 cardbody">
        <Card.Img
          variant="right"
          src={logoImage}
          className="container logoimage"
        />
        <h1 className="logoname2">
          <span className="F">FC</span> <span className="A">AI</span>
        </h1>
      </Card>
    </div>
  );
}

export default LoginPage;