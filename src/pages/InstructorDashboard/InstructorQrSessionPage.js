import Container from "react-bootstrap/Container";
import QrCodePanel from "../../components/instructor/QrCodePanel";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorQrSessionPage() {
  const { session, qrPayload, qrRefreshSeconds, isQrAnimating } =
    useInstructorWorkspace();

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="QR Session"
          subtitle="Display and auto-refresh the lecture QR code for secure attendance."
        />

        <div className="dash-main-row">
          <QrCodePanel
            session={session}
            qrPayload={qrPayload}
            qrRefreshSeconds={qrRefreshSeconds}
            isQrAnimating={isQrAnimating}
          />
        </div>
      </Container>
    </div>
  );
}

export default InstructorQrSessionPage;
