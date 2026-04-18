import Alert from "react-bootstrap/Alert";
import Placeholder from "react-bootstrap/Placeholder";
import Spinner from "react-bootstrap/Spinner";

function DataStateView({
  loading,
  error,
  isEmpty,
  emptyMessage,
  loadingVariant = "skeleton",
  children,
}) {
  if (loading) {
    if (loadingVariant === "spinner") {
      return (
        <div className="state-wrap center">
          <Spinner animation="border" role="status" size="sm" />
          <span className="ms-2">Loading...</span>
        </div>
      );
    }

    return (
      <div className="state-wrap">
        {[...Array(3)].map((_, idx) => (
          <Placeholder
            key={`ph-${idx}`}
            as="p"
            animation="glow"
            className="mb-2"
          >
            <Placeholder xs={12} />
          </Placeholder>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-0">
        {error}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <p className="empty-hint mb-0">{emptyMessage || "No data found."}</p>
    );
  }

  return children;
}

export default DataStateView;
