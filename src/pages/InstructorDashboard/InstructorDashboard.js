import { useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import OverviewCards from "../../components/instructor/OverviewCards";
import DataStateView from "../../components/instructor/shared/DataStateView";
import InstructorPageHero from "../../components/instructor/InstructorPageHero";
import { useInstructorWorkspace } from "../../context/InstructorWorkspaceContext";
import "../Dashboard/Dashboard.css";
import "./InstructorDashboard.css";

function InstructorDashboard() {
  const {
    dashboardData,
    dashboardState,
    loadDashboard,
    setTrendRange,
  } = useInstructorWorkspace();

  useEffect(() => {
    loadDashboard();
    // Initial load only to avoid callback-identity loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trendPeak = Math.max(
    1,
    ...((dashboardData.trends || []).map((item) => item.attendanceRate) || [1]),
  );

  return (
    <div className="dashcontent admin-dashboard instructor-dashboard-page">
      <Container fluid>
        <InstructorPageHero
          title="Instructor Dashboard"
          subtitle="Quick overview of your courses, students, lectures, and attendance rate."
        />

        {dashboardState.warning && (
          <Alert variant="warning" className="mt-3 mb-0">
            {dashboardState.warning}
          </Alert>
        )}

        <DataStateView
          loading={dashboardState.loading}
          error={dashboardState.error}
          isEmpty={false}
        >
          <>
            <OverviewCards overview={dashboardData.overview || {}} />

            <section className="instructor-grid mt-3">
              <Card className="instructor-surface">
                <Card.Body>
                  <div className="section-head section-head-row">
                    <div>
                      <h5 className="section-title">Attendance Trends</h5>
                      <p className="section-subtitle">
                        Daily, weekly, and monthly direction
                      </p>
                    </div>
                    <ButtonGroup size="sm" aria-label="Trend range switcher">
                      {[
                        { key: "daily", label: "Daily" },
                        { key: "weekly", label: "Weekly" },
                        { key: "monthly", label: "Monthly" },
                      ].map((item) => (
                        <Button
                          key={item.key}
                          variant={
                            dashboardData.trendRange === item.key
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() => setTrendRange(item.key)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </div>

                  <DataStateView
                    loading={dashboardState.loading}
                    error=""
                    isEmpty={(dashboardData.trends || []).length === 0}
                    emptyMessage="No trends available."
                  >
                    <div className="trend-list">
                      {(dashboardData.trends || []).map((trend) => (
                        <div className="trend-item" key={trend.label}>
                          <div className="trend-label-row">
                            <span>{trend.label}</span>
                            <strong>{trend.attendanceRate}%</strong>
                          </div>
                          <ProgressBar
                            now={(trend.attendanceRate / trendPeak) * 100}
                            className="trend-progress"
                          />
                        </div>
                      ))}
                    </div>
                  </DataStateView>
                </Card.Body>
              </Card>

              <Card className="instructor-surface">
                <Card.Body>
                  <div className="section-head">
                    <h5 className="section-title">Upcoming Sessions</h5>
                    <p className="section-subtitle">
                      From /instructor/dashboard/upcoming-sessions
                    </p>
                  </div>

                  <DataStateView
                    loading={dashboardState.loading}
                    error=""
                    isEmpty={
                      (dashboardData.upcomingSessions || []).length === 0
                    }
                    emptyMessage="No upcoming sessions found."
                  >
                    <div className="stack-list">
                      {(dashboardData.upcomingSessions || [])
                        .slice(0, 5)
                        .map((session) => (
                          <div
                            className="stack-item"
                            key={
                              session.id || `${session.title}-${session.date}`
                            }
                          >
                            <div>
                              <strong>
                                {session.title ||
                                  session.courseName ||
                                  session.id}
                              </strong>
                              <p className="mb-0 text-muted small">
                                {session.date || "No date"}{" "}
                                {session.startTime
                                  ? `at ${session.startTime}`
                                  : ""}
                              </p>
                            </div>
                            <Badge
                              bg={
                                session.status === "live"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {session.status || "scheduled"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </DataStateView>
                </Card.Body>
              </Card>

              <Card className="instructor-surface">
                <Card.Body>
                  <div className="section-head">
                    <h5 className="section-title">Recent Activity</h5>
                    <p className="section-subtitle">
                      From /instructor/dashboard/recent-activity
                    </p>
                  </div>

                  <DataStateView
                    loading={dashboardState.loading}
                    error=""
                    isEmpty={(dashboardData.recentActivity || []).length === 0}
                    emptyMessage="No activity available."
                  >
                    <div className="stack-list compact">
                      {(dashboardData.recentActivity || [])
                        .slice(0, 6)
                        .map((activity) => (
                          <div
                            className="stack-item"
                            key={activity.id || activity.title}
                          >
                            <div>
                              <strong>
                                {activity.title || activity.message}
                              </strong>
                              <p className="mb-0 text-muted small">
                                {activity.subtitle || activity.time || "Now"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </DataStateView>
                </Card.Body>
              </Card>

              <Card className="instructor-surface">
                <Card.Body>
                  <div className="section-head">
                    <h5 className="section-title">Alerts</h5>
                    <p className="section-subtitle">
                      From /instructor/dashboard/alerts
                    </p>
                  </div>

                  <DataStateView
                    loading={dashboardState.loading}
                    error=""
                    isEmpty={(dashboardData.alerts || []).length === 0}
                    emptyMessage="No alerts at the moment."
                    loadingVariant="spinner"
                  >
                    <div className="stack-list compact">
                      {(dashboardData.alerts || []).map((alertItem) => (
                        <Alert
                          key={alertItem.id || alertItem.message}
                          variant={
                            alertItem.severity === "warning"
                              ? "warning"
                              : "info"
                          }
                          className="py-2 mb-2"
                        >
                          {alertItem.message}
                        </Alert>
                      ))}
                    </div>
                  </DataStateView>
                </Card.Body>
              </Card>
            </section>
          </>
        </DataStateView>
      </Container>
    </div>
  );
}

export default InstructorDashboard;
