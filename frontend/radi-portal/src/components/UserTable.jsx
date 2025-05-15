import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import * as XLSX from "xlsx";

const UserTable = ({
  users = [],
  searchTerm = "",
  setSearchTerm,
  certificationFilter,
  setCertificationFilter,
  skillFilter,
  setSkillFilter,
  currentPage,
  setCurrentPage,
  setUsers, // Expected to be a function
}) => {
  const usersPerPage = 10;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  // Filter users based on search term, certifications, and skills
  const filteredUsers = users.filter((user) => {
    return (
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (certificationFilter
        ? user.certifications?.includes(certificationFilter)
        : true) &&
      (skillFilter
        ? user.skills?.some((skill) =>
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          )
        : true)
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
    const data = filteredUsers.map((user) => ({
      Name: user.fullName,
      Email: user.email,
      Certifications: user.certifications?.join(", ") || "N/A",
      Skills: user.skills?.join(", ") || "N/A",
      "Years of Experience": user.yearsOfExperience || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Filtered_Users.xlsx");
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmInput("");
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (confirmInput !== "CONFIRM") {
      alert('Please type "CONFIRM" exactly to delete.');
      return;
    }

    if (!userToDelete) return;

    try {
      // DELETE request
      const deleteResponse = await fetch(
        `http://localhost:5000/api/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        const deleteErrorData = await deleteResponse.json().catch(() => ({}));
        throw new Error(
          deleteErrorData.message ||
            `Delete failed with status ${deleteResponse.status}`
        );
      }

      // Optimistically update state locally if setUsers is available
      if (typeof setUsers === "function") {
        const updatedUsers = users.filter(
          (user) => user._id !== userToDelete._id
        );
        setUsers(updatedUsers);
        setCurrentPage(1);
      } else {
        console.warn("setUsers is not a function, skipping local state update");
      }

      // Refetch users to ensure sync with backend
      try {
        const updatedUsersResponse = await fetch(
          "http://localhost:5000/api/users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!updatedUsersResponse.ok) {
          const updateErrorData = await updatedUsersResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            updateErrorData.message ||
              `Failed to fetch updated users with status ${updatedUsersResponse.status}`
          );
        }

        const updatedUsersData = await updatedUsersResponse.json();
        console.log("Refetched users data:", updatedUsersData); // Debug log

        // Handle different response formats
        let newUsers = updatedUsersData;
        if (!Array.isArray(updatedUsersData)) {
          if (updatedUsersData.users && Array.isArray(updatedUsersData.users)) {
            newUsers = updatedUsersData.users; // Handle { users: [...] }
          } else if (
            updatedUsersData.data &&
            Array.isArray(updatedUsersData.data)
          ) {
            newUsers = updatedUsersData.data; // Handle { data: [...] }
          } else {
            console.warn("Unexpected response format, skipping state update");
            newUsers = users.filter((user) => user._id !== userToDelete._id);
          }
        }

        if (typeof setUsers === "function") {
          setUsers(newUsers);
        } else {
          console.warn(
            "setUsers is not a function, cannot update state with refetched data"
          );
        }

        alert("User deleted successfully");
      } catch (fetchError) {
        console.warn(
          "Failed to refetch users, using local state if available:",
          fetchError.message
        );
        alert("User deleted successfully (local state may not be updated)");
      }
    } catch (error) {
      console.error("Error during deletion process:", error.message);
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setShowConfirmDelete(false);
      setUserToDelete(null);
      setConfirmInput("");
    }
  };

  return (
    <>
      {showConfirmDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmDelete(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete user "
                  <strong>{userToDelete?.fullName}</strong>"? This action cannot
                  be undone.
                </p>
                <p>
                  Please type <strong>CONFIRM</strong> to proceed ("case
                  sensitive"):
                </p>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type CONFIRM here"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Users</h2>
        <button className="btn btn-success" onClick={handleExcelDownload}>
          Download Excel
        </button>
      </div>

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

      <div className="card hidden sm:block bg-dark text-white shadow-sm">
        <div className="card-body p-0">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr>
                <th>USER</th>
                <th>CERTIFICATIONS</th>
                <th>SKILLS</th>
                <th>YEARS OF EXPERIENCE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaUserCircle size={32} className="me-2" />
                        <div>
                          <div className="fw-bold">{user.fullName}</div>
                          <div className="text small">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.certifications?.length > 0 ? (
                        user.certifications.map((cert, index) => (
                          <span key={index} className="badge bg-primary me-1">
                            {cert}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No certifications</span>
                      )}
                    </td>
                    <td>
                      {user.skills?.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`badge me-1 ${
                              skill.toLowerCase().includes("python")
                                ? "bg-purple"
                                : skill.toLowerCase().includes("javascript")
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td className="fw-bold">
                      {user.yearsOfExperience || "N/A"}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-light btn-sm me-2"
                        disabled
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 d-flex justify-content-between align-items-center">
          <div>
            {filteredUsers.length > 0 && (
              <small>
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} entries
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
    </>
  );
};

export default UserTable;
