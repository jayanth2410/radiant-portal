import React, { useState } from "react";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import * as XLSX from "xlsx"; // Import the xlsx library

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

const users = Array.from({ length: 97 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  certifications: i % 2 === 0 ? ["AWS"] : ["GCP"], // Alternate between AWS and GCP
  skills: i % 3 === 0 
    ? ["Python", "JavaScript"] 
    : i % 3 === 1 
    ? ["Java", "SQL"] 
    : ["Cloud", "DevOps"], // Rotate between different skill sets
  experience: `${Math.floor(Math.random() * 10) + 1} years`, // Random experience between 1 and 10 years
  certification: i % 4 === 0 ? "Certified" : "Pending", // Alternate between Certified and Pending
}));

  const usersPerPage = 10;

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (certificationFilter ? user.certifications.includes(certificationFilter) : true) &&
      (skillFilter ? user.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())) : true)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleExcelDownload = () => {
    // Prepare data for Excel
    const data = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Certifications: user.certifications.join(", "),
      Skills: user.skills.join(", "),
      Experience: user.experience,
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Download the Excel file
    XLSX.writeFile(workbook, "Filtered_Users.xlsx");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#121212" }}>
      {/* Sidebar */}

      
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">Admin</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">Dashboard</a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">Users</a>
          </li>
          <li className="nav-item mb-2">
            <a href="#" className="nav-link text-white">Settings</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="container py-4 flex-grow-1">
        {/* Top Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-white">Admin Panel</h2>
          <button className="btn btn-success" onClick={handleExcelDownload}>
            Download Excel
          </button>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={certificationFilter}
              onChange={(e) => {
                setCertificationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Filter by Certification</option>
              <option value="AWS">AWS</option>
              <option value="GCP">GCP</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={skillFilter}
              onChange={(e) => {
                setSkillFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Filter by Skill</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Java">Java</option>
              <option value="SQL">SQL</option>
              <option value="Cloud">Cloud</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-dark text-white shadow-sm">
          <div className="card-body p-0">
            <table className="table table-dark table-hover mb-0">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>CERTIFICATIONS</th>
                  <th>SKILLS</th>
                  <th>EXPERIENCE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>

                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      {/* User */}
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserCircle size={32} className="me-2" />
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <div className="text small">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Certifications */}
                      <td>
                        {user.certifications.map((cert, index) => (
                          <span key={index} className="badge bg-primary me-1">{cert}</span>
                        ))}
                      </td>

                      {/* Skills */}
                      <td>
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`badge me-1 ${
                              skill.toLowerCase().includes("python") ? "bg-purple" :
                              skill.toLowerCase().includes("javascript") ? "bg-warning text-dark" :
                              "bg-secondary"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </td>

                      {/* Experience */}
                      <td className="fw-bold">{user.experience}</td>

                      {/* Actions */}
                      <td>
                        <button className="btn btn-outline-light btn-sm me-2">
                          <FaEdit />
                        </button>
                        <button className="btn btn-outline-danger btn-sm">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 d-flex justify-content-between align-items-center">
            <div>
              {filteredUsers.length > 0 && (
                <small>
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                </small>
              )}
            </div>
            <div>
              {filteredUsers.length > usersPerPage && (
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="mx-2">{currentPage}</span>
                  <button
                    className="btn btn-sm btn-outline-light ms-2"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;