import React, { useState } from "react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
    techUsed: [],
  });
  const [newTech, setNewTech] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  const handleAddProject = () => {
    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.startDate ||
      !newProject.endDate
    ) {
      alert("Please fill in all the required fields.");
      return;
    }
    setProjects([newProject, ...projects]);
    setNewProject({
      title: "",
      role: "",
      description: "",
      startDate: "",
      endDate: "",
      techUsed: [],
    });
    setShowAddProject(false);
  };

  const handleDeleteProject = (title) => {
    const confirmation = prompt(
      `To delete the project, type its name: "${title}"`
    );
    if (confirmation === title) {
      setProjects(projects.filter((proj) => proj.title !== title));
    } else {
      alert("Project name did not match. Deletion canceled.");
    }
  };

  const handleEditProject = (index) => {
    const projToEdit = projects[index];
    setNewProject(projToEdit);
    setShowAddProject(true);
    // Remove the project being edited from the list temporarily
    setProjects(projects.filter((_, i) => i !== index));
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

  return (
    <div className="mb-5">
      <h2>Projects</h2>

      {/* No Projects Placeholder */}
      {projects.length === 0 && !showAddProject && (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            height: "300px",
            backgroundColor: "#333",
            borderRadius: "8px",
            color: "#fff",
          }}
        >
          <i
            className="bi bi-folder"
            style={{ fontSize: "3rem", color: "#7c3aed" }}
          ></i>
          <p className="mt-3">No projects added yet.</p>
        </div>
      )}

      {/* List of Projects */}
      {projects.map((proj, index) => (
        <div
          key={index}
          className="card bg-dark text-white p-3 mb-3 d-flex flex-row align-items-center"
          style={{ borderRadius: "8px" }}
        >
          {/* Content Section */}
          <div className="flex-grow-1">
            <h3 className="mb-2">{proj.title}</h3>
            <p className="mb-1" style={{ fontSize: "0.9rem", color: "#b5b5b5" }}>
              <i className="bi bi-calendar3" style={{ color: "#fff" }}></i>{" "}
              {`${proj.startDate} - ${proj.endDate}`}
            </p>
            <p className="mb-1" style={{ fontSize: "0.9rem", color: "#d1d1d1" }}>
              Role: {proj.role || "N/A"}
            </p>
            <p className="mb-2" style={{ fontSize: "0.9rem", color: "#d1d1d1" }}>
              {proj.description}
            </p>
            <div className="d-flex flex-wrap gap-2">
              {proj.techUsed.map((tech, index) => (
                <span
                  key={index}
                  className="badge bg-primary"
                  style={{ fontSize: "0.9rem" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Edit/Delete Buttons */}
          <div className="d-flex flex-column align-items-end">
            <button
              className="btn btn-sm btn-danger mb-2"
              onClick={() => handleDeleteProject(proj.title)}
              style={{ width: "7rem" }}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleEditProject(index)}
              style={{ width: "7rem" }}
            >
              Edit
            </button>
          </div>
        </div>
      ))}

      {/* Add Project Button */}
      {!showAddProject && (
        <div className="text-center mt-4">
          <button
            className="btn"
            style={{ backgroundColor: "#7c3aed", color: "#fff" }}
            onClick={() => setShowAddProject(true)}
          >
            + Add Project
          </button>
        </div>
      )}

      {/* Add Project Form */}
      {showAddProject && (
        <div className="bg-dark text-white p-4" style={{ borderRadius: "0.5rem" }}>
          <h2 className="text-center">Add Project</h2>
          <div className="mb-2">
            <label htmlFor="projectTitle" className="form-label">
              Project Title
            </label>
            <input
              id="projectTitle"
              type="text"
              className="form-control bg-dark text-white"
              placeholder="Enter Project Title (e.g., E-commerce Platform)"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="projectRole" className="form-label">
              Role
            </label>
            <input
              id="projectRole"
              type="text"
              className="form-control bg-dark text-white"
              placeholder="Enter Role (e.g., Developer, Team Lead)"
              value={newProject.role || ""}
              onChange={(e) =>
                setNewProject({ ...newProject, role: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="projectDescription" className="form-label">
              Project Description
            </label>
            <textarea
              id="projectDescription"
              className="form-control bg-dark text-white"
              placeholder="Enter Project Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="projectStartDate" className="form-label">
              Start Date
            </label>
            <input
              id="projectStartDate"
              type="date"
              className="form-control bg-dark text-white"
              value={newProject.startDate}
              onChange={(e) =>
                setNewProject({ ...newProject, startDate: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="projectEndDate" className="form-label">
              End Date
            </label>
            <input
              id="projectEndDate"
              type="date"
              className="form-control bg-dark text-white"
              value={newProject.endDate}
              onChange={(e) =>
                setNewProject({ ...newProject, endDate: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="projectTech" className="form-label">
              Technologies Used
            </label>
            <input
              id="projectTech"
              type="text"
              className="form-control bg-dark text-white"
              placeholder="Enter Technology (e.g., React, Node.js)"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={handleAddTech}>
              + Add Technology
            </button>
          </div>
          <div className="mb-2 d-flex flex-wrap gap-2">
            {newProject.techUsed.map((tech, index) => (
              <span
                key={index}
                className="badge d-flex align-items-center"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "1rem",
                  background: "#A4A5A1",
                  color: "black",
                }}
              >
                {tech}
                <button
                  type="button"
                  className="btn-close btn-close-dark ms-2"
                  style={{ fontSize: "0.8rem" }}
                  aria-label="Remove"
                  onClick={() => handleRemoveTech(index)}
                ></button>
              </span>
            ))}
          </div>
          <button
            className="btn btn-success"
            onClick={handleAddProject}
            style={{ width: "10rem", marginTop: "2rem" }}
          >
            Confirm
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => setShowAddProject(false)}
            style={{ width: "10rem", marginTop: "2rem" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;