import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    myRole: "",
    description: "",
    startDate: "",
    endDate: "",
    techUsed: [],
  });
  const [newTech, setNewTech] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  // State to track "Read More" toggle for each project
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("[DEBUG] Fetched projects:", response.data.projects.length);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("[ERROR] Fetching projects:", error.message);
      toast.error(error.response?.data?.message || "Failed to fetch projects", {
        autoClose: 1000,
        theme: "dark",
      });
    }
  };

  const handleAddOrUpdateProject = async () => {
    if (
      !newProject.title ||
      !newProject.myRole ||
      !newProject.description ||
      !newProject.startDate
    ) {
      console.log("[DEBUG] Validation failed: Required fields missing");
      toast.error("Title, role, description, and start date are required", {
        autoClose: 1000,
        theme: "dark",
      });
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        title: newProject.title,
        myRole: newProject.myRole,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate || null,
        techUsed: newProject.techUsed,
      };

      let response;
      if (editId) {
        console.log("[DEBUG] Updating project:", { projectId: editId });
        response = await axios.put(
          `http://localhost:5000/api/projects/${editId}`,
          projectData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProjects(
          projects.map((proj) =>
            proj._id === editId ? response.data.project : proj
          )
        );
        toast.success("Project updated successfully!", {
          autoClose: 1000,
          theme: "dark",
        });
      } else {
        console.log("[DEBUG] Creating new project");
        response = await axios.post(
          `http://localhost:5000/api/projects`,
          projectData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProjects([response.data.project, ...projects]);
        toast.success("Project added successfully!", {
          autoClose: 1000,
          theme: "dark",
        });
      }

      resetForm();
    } catch (error) {
      console.error("[ERROR] Saving project:", error.message);
      toast.error(error.response?.data?.message || "Failed to save project", {
        autoClose: 1000,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, title) => {
    const confirmation = prompt(
      `To delete the project, type its name: "${title}"`
    );
    if (confirmation !== title) {
      console.log("[DEBUG] Deletion canceled: Name mismatch");
      toast.error("Project name did not match. Deletion canceled.", {
        autoClose: 1000,
        theme: "dark",
      });
      return;
    }

    try {
      console.log("[DEBUG] Deleting project:", { projectId });
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(projects.filter((proj) => proj._id !== projectId));
      toast.success("Project deleted successfully!", {
        autoClose: 1000,
        theme: "dark",
      });
    } catch (error) {
      console.error("[ERROR] Deleting project:", error.message);
      toast.error(error.response?.data?.message || "Failed to delete project", {
        autoClose: 1000,
        theme: "dark",
      });
    }
  };

  const handleEditProject = (proj) => {
    console.log("[DEBUG] ureactjs copyediting project:", { projectId: proj._id });
    setNewProject({
      title: proj.title,
      myRole: proj.myRole,
      description: proj.description,
      startDate: proj.startDate.split("T")[0],
      endDate: proj.endDate ? proj.endDate.split("T")[0] : "",
      techUsed: proj.techUsed,
    });
    setEditId(proj._id);
    setShowModal(true);
  };

  const handleAddTech = () => {
    if (newTech.trim()) {
      setNewProject({
        ...newProject,
        techUsed: [...newProject.techUsed, newTech.trim()],
      });
      setNewTech("");
    }
  };

  const handleRemoveTech = (index) => {
    setNewProject({
      ...newProject,
      techUsed: newProject.techUsed.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setNewProject({
      title: "",
      myRole: "",
      description: "",
      startDate: "",
      endDate: "",
      techUsed: [],
    });
    setNewTech("");
    setEditId(null);
    setShowModal(false);
  };

  // Toggle "Read More" for a specific project
  const toggleDescription = (projectId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Truncate description if longer than 150 characters
  const truncateDescription = (description, projectId) => {
    const limit = 150;
    if (description.length <= limit || expandedDescriptions[projectId]) {
      return description;
    }
    return (
      <>
        {description.substring(0, limit)}...
        <button
          className="btn btn-link p-0 ms-1 text-info"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
          onClick={() => toggleDescription(projectId)}
        >
          Read More <i className="bi bi-chevron-down"></i>
        </button>
      </>
    );
  };

  return (
    <div className="container">
      <h2
        className="mb-4 text-white fw-bold"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <i className="bi bi-briefcase me-2"></i>Projects
      </h2>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
      />

      {/* Add Project Button */}
      <div className="text-center mb-4">
        <button
          className="btn btn-primary px-4 py-2"
          style={{
            backgroundColor: "#7c3aed",
            border: "none",
            fontFamily: "'Roboto', sans-serif",
            fontSize: "1rem",
            borderRadius: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#6b32cc")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#7c3aed")
          }
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Project
        </button>
      </div>

      {/* No Projects Placeholder */}
      {projects.length === 0 && (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-white"
          style={{
            backgroundColor: "#222",
            borderRadius: "10px",
            padding: "3rem",
            border: "1px solid #444",
          }}
        >
          <i
            className="bi bi-folder"
            style={{ fontSize: "3rem", color: "#e2e8f0" }}
          ></i>
          <p
            className="mt-3"
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1.1rem",
              color: "#e2e8f0",
            }}
          >
            No projects added yet.
          </p>
        </div>
      )}

      {/* Projects List */}
      <div className="row">
        {projects.map((proj) => (
          <div key={proj._id} className="col-md-6 col-lg-4 mb-4">
            <div
              className="card bg-dark text-white h-100 shadow-lg"
              style={{
                borderRadius: "10px",
                border: "1px solid #444",
                backgroundColor: "#222",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div className="card-body">
                <h5
                  className="card-title text-info"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "2rem",
                  }}
                >
                  <i className="bi bi-code-slash me-2"></i>
                  {proj.title}
                </h5>
                <p
                  className="card-text"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    fontSize: "1.1rem",
                    color: "#e2e8f0",
                  }}
                >
                  <i className="bi bi-person-circle me-2 text-warning"></i>
                  {proj.myRole}
                </p>
                <h6
                  className="mt-3"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#e2e8f0",
                  }}
                >
                  <i className="bi bi-calendar3 me-2 text-warning"></i>Date Range
                </h6>
                <p
                  className="card-text"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    color: "#e2e8f0",
                  }}
                >
                  {new Date(proj.startDate).toLocaleDateString()} -{" "}
                  {proj.endDate
                    ? new Date(proj.endDate).toLocaleDateString()
                    : "Ongoing"}
                </p>
                <h6
                  className="mt-3"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#e2e8f0",
                  }}
                >
                  <i className="bi bi-file-text me-2 text-warning"></i>Project Details
                </h6>
                <p
                  className="card-text"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    color: "#e2e8f0",
                  }}
                >
                  {truncateDescription(proj.description, proj._id)}
                  {expandedDescriptions[proj._id] && (
                    <button
                      className="btn btn-link p-0 ms-1 text-info"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "0.9rem",
                        textDecoration: "none",
                      }}
                      onClick={() => toggleDescription(proj._id)}
                    >
                      Read Less <i className="bi bi-chevron-up"></i>
                    </button>
                  )}
                </p>
                <h6
                  className="mt-3"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#e2e8f0",
                  }}
                >
                  <i className="bi bi-tools me-2 text-warning"></i>Technologies Used
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {proj.techUsed.map((tech, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        backgroundColor: "#444",
                        color: "#ffffff",
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "6px",
                      }}
                    >
                      <i className="bi bi-gear-fill me-1"></i>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm px-3 py-1"
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#000",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0a800")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffc107")
                  }
                  onClick={() => handleEditProject(proj)}
                >
                  <i className="bi bi-pencil me-1"></i> Edit
                </button>
                <button
                  className="btn btn-sm px-3 py-1"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c82333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc3545")
                  }
                  onClick={() => handleDeleteProject(proj._id, proj.title)}
                >
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Project */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content bg-dark text-white"
              style={{
                borderRadius: "12px",
                border: "1px solid #444",
                backgroundColor: "#222",
              }}
            >
              <div className="modal-header">
                <h5
                  className="modal-title"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "#ffffff",
                  }}
                >
                  <i
                    className={`bi bi-${
                      editId ? "pencil-square" : "plus-circle"
                    } me-2`}
                  ></i>
                  {editId ? "Edit Project" : "Add Project"}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={resetForm}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label
                    htmlFor="projTitle"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-type me-2"></i>Title
                  </label>
                  <input
                    id="projTitle"
                    type="text"
                    className="form-control bg-dark text-white"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    placeholder="e.g., E-commerce Platform"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.9rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      backgroundColor: "#222",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="projRole"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-person-circle me-2"></i>Role
                  </label>
                  <input
                    id="projRole"
                    type="text"
                    className="form-control bg-dark text-white"
                    value={newProject.myRole}
                    onChange={(e) =>
                      setNewProject({ ...newProject, myRole: e.target.value })
                    }
                    placeholder="e.g., Frontend Developer"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.9rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      backgroundColor: "#222",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="projDescription"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-file-text me-2"></i>Project Details
                  </label>
                  <textarea
                    id="projDescription"
                    className="form-control bg-dark text-white"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the project"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.9rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      backgroundColor: "#222",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="projStartDate"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-calendar3 me-2"></i>Date Range
                  </label>
                  <input
                    id="projStartDate"
                    type="date"
                    className="form-control bg-dark text-white"
                    value={newProject.startDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        startDate: e.target.value,
                      })
                    }
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.9rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      backgroundColor: "#222",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="projEndDate"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-calendar-check me-2"></i>End Date
                    (Optional)
                  </label>
                  <input
                    id="projEndDate"
                    type="date"
                    className="form-control bg-dark text-white"
                    value={newProject.endDate}
                    onChange={(e) =>
                      setNewProject({ ...newProject, endDate: e.target.value })
                    }
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: "0.9rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      backgroundColor: "#222",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="projTech"
                    className="form-label"
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <i className="bi bi-tools me-2"></i>Technologies Used
                  </label>
                  <div className="input-group">
                    <input
                      id="projTech"
                      type="text"
                      className="form-control bg-dark text-white"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="e.g., React"
                      style={{
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "0.9rem",
                        border: "1px solid #444",
                        borderRadius: "8px 0 0 8px",
                        backgroundColor: "#222",
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{
                        backgroundColor: "#7c3aed",
                        border: "none",
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: "0.9rem",
                        borderRadius: "0 8px 8px 0",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#6b32cc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#7c3aed")
                      }
                      onClick={handleAddTech}
                    >
                      <i className="bi bi-plus-circle me-1"></i>Add
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {newProject.techUsed.map((tech, index) => (
                      <span
                        key={index}
                        className="badge d-flex align-items-center"
                        style={{
                          backgroundColor: "#444",
                          color: "#ffffff",
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: "0.85rem",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "6px",
                        }}
                      >
                        <i className="bi bi-gear-fill me-1"></i>
                        {tech}
                        <button
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: "0.6rem" }}
                          onClick={() => handleRemoveTech(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-sm px-3 py-1"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#c82333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc3545")
                  }
                  onClick={resetForm}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>Cancel
                </button>
                <button
                  className="btn btn-sm px-3 py-1"
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#218838")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#28a745")
                  }
                  onClick={handleAddOrUpdateProject}
                  disabled={loading}
                >
                  <i
                    className={`bi bi-${
                      loading ? "arrow-repeat" : "check-circle"
                    } me-1`}
                  ></i>
                  {loading ? "Saving..." : editId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;