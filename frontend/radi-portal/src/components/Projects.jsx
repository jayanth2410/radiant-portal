import React from "react";
import Certification from "./Certification";
import Projects from "./Projects";


const Profile = () => {
    return (
      <div style={{ backgroundColor: "#000", color: "#fff" }}>
        <div className="container py-4">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle"
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#333",
                  }}
                >
                  {/* User Icon */}
                </div>
                <div className="ms-3">
                  <h4>Name</h4>
                  <p>EmployeeID</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <h4>Role</h4>
              <p>Experience (Years)</p>
            </div>
          </div>
  
          {/* Certifications Section */}
          <Certification />
  
          {/* Projects Section */}
          <Projects />
        </div>
      </div>
    );
  };
  
  export default Profile;