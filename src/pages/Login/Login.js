import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // ✅ شيل data و Navigate
import { loginUser } from "../../services/auth";
import { getDefaultRouteByRole } from "../../routes/roleBasedRoutes";
import logoImage from "../../assets/images/logo.png";
import "./Login.css";

const getRoleFromToken = (token) => {
  try {
    if (!token) {
      return "";
    }

    const payload = token.split(".")[1] || "";
    if (!payload) {
      return "";
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return (decoded?.role || "").toLowerCase();
  } catch {
    return "";
  }
};

function LoginPage() {
  const navigate = useNavigate(); // ✅ c صغير

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("adminName", data.user?.fullName || "Admin");
      localStorage.setItem("adminEmail", data.user?.email || "");
      const normalizedRole = (
        data.user?.role?.toLowerCase() || getRoleFromToken(data.token)
      ).trim();
      localStorage.setItem("adminRole", normalizedRole);

      const redirectTo = getDefaultRouteByRole(normalizedRole);
      navigate(redirectTo);
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
    <div className="login-screen">
      <div className="login-background-orb login-background-orb-left" />
      <div className="login-background-orb login-background-orb-right" />

      <div className="login-shell container">
        <Card className="border-0 login-panel login-panel-brand">
          <Card.Body>
            <div className="login-brand-top">
              <h1 className="logoname">
                <span className="F">FC</span> <span className="A">AI</span>
              </h1>
              <p className="logotext">FCAI Attendance Platform</p>
            </div>

            <div className="login-brand-media-wrap">
              <Card.Img src={logoImage} className="logoimage" alt="FCAI Logo" />
            </div>

            <div className="brand-pill-list">
              <span className="brand-pill">Smart Attendance</span>
              <span className="brand-pill">Secure QR Sessions</span>
              <span className="brand-pill">Live Monitoring</span>
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 login-panel login-panel-form">
          <Card.Body className="cardbody">
            <Card.Title className="login-form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue to your dashboard.</p>
            </Card.Title>

            <Form className="form" onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="email">University Email</Form.Label>
                <Form.Control
                  className="username"
                  type="email"
                  placeholder="name@fcai.edu.eg"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  className="password"
                  type="password"
                  placeholder="Enter your password"
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
                <p className="login-error-msg">{mutation.error.message}</p>
              )}
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
