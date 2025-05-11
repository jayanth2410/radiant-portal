import React, { useState } from "react";

const Profile = () => {
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    title: "",
    image: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [showAddCertification, setShowAddCertification] = useState(false);

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

  const handleAddCertification = () => {
    if (!newCertification.title) {
      alert("Please enter the certification title.");
      return;
    }
    setCertifications([newCertification, ...certifications]);
    setNewCertification({ title: "", image: "", skills: [] });
    setShowAddCertification(false);
  };

  const handleDeleteCertification = (title) => {
    const confirmation = prompt(
      `To delete the certification, type its name: "${title}"`
    );
    if (confirmation === title) {
      setCertifications(certifications.filter((cert) => cert.title !== title));
    } else {
      alert("Certification name did not match. Deletion canceled.");
    }
  };

  const handleEditCertification = (index) => {
    const certToEdit = certifications[index];
    setNewCertification(certToEdit);
    setShowAddCertification(true);
    // Remove the certification being edited from the list temporarily
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setNewCertification({
        ...newCertification,
        skills: [...newCertification.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    setNewCertification({
      ...newCertification,
      skills: newCertification.skills.filter((_, i) => i !== index),
    });
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // "en-GB" formats the date as dd/mm/yyyy
  };

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
        <div className="mb-5">
          <h2>Certifications</h2>

          {/* List of Certifications */}
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="card bg-dark text-white p-3 mb-2 position-relative"
            >
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-2"
                aria-label="Close"
                onClick={() => handleDeleteCertification(cert.title)}
              ></button>
              <h3>{cert.title}</h3>
              {cert.image && (
                <img
                  src={cert.image}
                  alt={cert.title}
                  style={{ maxWidth: "100px", maxHeight: "100px" }}
                  className="mb-2"
                />
              )}
              <div>
                {cert.skills.map((skill, index) => (
                  <span key={index} className="badge bg-primary me-2">
                    {skill}
                  </span>
                ))}
              </div>
              <button
                className="btn btn-sm btn-danger position-absolute bottom-0 end-0 m-2"
                onClick={() => handleEditCertification(index)}
                style={{ width: "7rem" }}
              >
                Edit
              </button>
            </div>
          ))}

          {/* Add Certification Form */}
          {showAddCertification && (
            <div className="mb-3">
              <h2 className="text-center">Add Certification</h2>
              <div className="mb-2">
                <label htmlFor="certificationTitle" className="form-label">
                  Certification Title
                </label>
                <input
                  id="certificationTitle"
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Certification Title (e.g., Java Certification)"
                  value={newCertification.title}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-2">
                <label htmlFor="certificationImage" className="form-label">
                  Certification Image URL
                </label>
                <input
                  id="certificationImage"
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Image URL (optional)"
                  value={newCertification.image}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      image: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-2">
                <label htmlFor="certificationSkill" className="form-label">
                  Skills
                </label>
                <input
                  id="certificationSkill"
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Skill (e.g., Java, OOPs, Multithreading)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleAddSkill}
                >
                  + Add Skill
                </button>
              </div>
              {/* Skills List */}
              <div className="mb-2 d-flex flex-wrap gap-2">
                {newCertification.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge bg-dark d-flex align-items-center"
                    style={{ padding: "0.5rem 1rem", borderRadius: "1rem" }}
                  >
                    {skill}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.8rem" }}
                      aria-label="Remove"
                      onClick={() => handleRemoveSkill(index)}
                    ></button>
                  </span>
                ))}
              </div>
              <label></label>
              <button
                className="btn btn-success"
                onClick={handleAddCertification}
                style={{ width: "10rem", marginTop: "2rem" }}
              >
                Confirm
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={() => setShowAddCertification(false)}
                style={{ width: "10rem", marginTop: "2rem" }}
              >
                Cancel
              </button>
            </div>
          )}
          {!showAddCertification && (
            <button
              className="btn mt-2 mb-3"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}
              onClick={() => setShowAddCertification(true)}
            >
              + Add Certification
            </button>
          )}
        </div>

        {/* Projects Section */}
        <div className="mb-5">
          <h2>Projects</h2>

          {/* List of Projects */}
          {projects.map((proj, index) => (
            <div
              key={index}
              className="card bg-dark text-white position-relative mb-3"
              style={{
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-2"
                aria-label="Close"
                onClick={() => handleDeleteProject(proj.title)}
              ></button>
              <div className="card-body">
                <h3 className="card-title" style={{ color: "#f8f9fa" }}>
                  {proj.title}
                </h3>
                <p
                  className="card-text"
                  style={{ color: "#b5b5b5", fontSize: "0.8rem" }}
                >
                  <i className="bi bi-calendar3" style={{ color: "#fff" }}></i>{" "}
                  {/* Bootstrap Icon */}
                  {` ${formatDate(proj.startDate)} - ${formatDate(
                    proj.endDate
                  )}`}
                </p>
                <p
                  className="card-text"
                  style={{ color: "#d1d1d1", fontSize: "1rem" }}
                >
                  Role: {proj.role || "N/A"}
                </p>
                <p
                  className="card-text"
                  style={{ color: "#d1d1d1", fontSize: "0.9rem" }}
                >
                  {proj.description}
                </p>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {proj.techUsed.map((tech, index) => (
                    <span key={index} className="badge bg-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-sm btn-danger position-absolute bottom-0 end-0 m-2"
                onClick={() => handleEditProject(index)}
                style={{ width: "7rem" }}
              >
                Edit
              </button>
            </div>
          ))}

          {/* Add Project Form */}
          {showAddProject && (
            <div className="mb-3">
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
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
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
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleAddTech}
                >
                  + Add Technology
                </button>
              </div>
              {/* Technologies List */}
              <div className="mb-2 d-flex flex-wrap gap-2">
                {newProject.techUsed.map((tech, index) => (
                  <span
                    key={index}
                    className="badge bg-dark d-flex align-items-center"
                    style={{ padding: "0.5rem 1rem", borderRadius: "1rem" }}
                  >
                    {tech}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
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
          {!showAddProject && (
            <button
              className="btn mt-2 mb-3"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}
              onClick={() => setShowAddProject(true)}
            >
              + Add Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
