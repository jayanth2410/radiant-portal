import React, { useContext } from "react"; // Add useContext here
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "./UserContext";
import {
  FaHome,
  FaUser,
  FaCertificate,
  FaProjectDiagram,
  FaSignOutAlt,
  FaClipboardCheck,
  FaSun,
  FaCheckCircle,
  FaCode,
} from "react-icons/fa";

const HomePage = () => {
  const activity = ["activity1", "activity2", "activity3"];
  const { user } = useContext(UserContext);

  return (
    <div className="flex-grow-1 mb-5">
      <h3>Welcome back, {user.fullName}</h3>
      <p className="text-info">
        Here's what's happening with your projects today.
      </p>

      {/* Top Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Active Projects</h5>
                  <h3>{activity.length}</h3>
                  <small className="text-success">⬆ 4 from last month</small>
                </div>
                <FaClipboardCheck size={30} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Certifications</h5>
                  <h3>2</h3>
                  <small className="text-success">⬆ 2 new this month</small>
                </div>
                <FaSun size={30} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-dark text-white mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>Task Completion</h5>
                  <h3>94%</h3>
                  <small className="text-success">⬆ 6% from last week</small>
                </div>
                <FaCheckCircle size={30} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-dark text-white">
        <div className="card-body">
          <h5 className="mb-4">Recent Activity</h5>
          {activity.length > 0 ? (
            activity.map((item, index) => (
              <div
                key={index}
                className="d-flex align-items-center mb-3"
                style={{
                  borderBottom: "1px solid #444",
                  paddingBottom: "0.5rem",
                }}
              >
                <FaCode className="me-3 text-info" size={20} />
                <span>{item}</span>
              </div>
            ))
          ) : (
            <p className="text-muted">No recent activity to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;