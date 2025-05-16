import React, { useState } from "react";

const Certification = () => {
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    title: "",
    image: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [showAddCertification, setShowAddCertification] = useState(false);

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

  return (
    <div className="mb-5">
      <h2
        className="mb-4 text-white fw-bold"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Certifications
      </h2>

      {/* No Certifications Placeholder */}
      {certifications.length === 0 && !showAddCertification && (
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
            className="bi bi-file-earmark-text"
            style={{ fontSize: "3rem", color: "#7c3aed" }}
          ></i>
          <p className="mt-3">No certifications added yet.</p>
        </div>
      )}

      {/* Add Certification Button */}
      {!showAddCertification && (
        <div className="text-center mt-4" style={{ marginBottom: "2rem" }}>
          <button
            className="btn"
            style={{ backgroundColor: "#7c3aed", color: "#fff" }}
            onClick={() => setShowAddCertification(true)}
          >
            + Add Certification
          </button>
        </div>
      )}

      {/* Add Certification Form */}
      {showAddCertification && (
        <div
          className="bg-dark text-white p-4"
          style={{ borderRadius: "0.5rem", marginBottom: "2rem" }}
        >
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
            <button className="btn btn-primary mt-2" onClick={handleAddSkill}>
              + Add Skill
            </button>
          </div>
          {/* Skills List */}
          <div className="mb-2 d-flex flex-wrap gap-2">
            {newCertification.skills.map((skill, index) => (
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
                {skill}
                <button
                  type="button"
                  className="btn-close btn-close-dark ms-2"
                  style={{ fontSize: "0.8rem" }}
                  aria-label="Remove"
                  onClick={() => handleRemoveSkill(index)}
                ></button>
              </span>
            ))}
          </div>
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

      {/* List of Certifications */}
      {certifications.map((cert, index) => (
        <div
          key={index}
          className="card bg-dark text-white p-3 mb-3 d-flex flex-row align-items-center"
          style={{ borderRadius: "8px" }}
        >
          {/* Image Section */}
          {cert.image && (
            <img
              src={cert.image}
              alt={cert.title}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
                marginRight: "1rem",
              }}
            />
          )}

          {/* Content Section */}
          <div className="flex-grow-1">
            <h3 className="mb-2">{cert.title}</h3>
            <div className="d-flex flex-wrap">
              {cert.skills.map((skill, index) => (
                <span
                  key={index}
                  className="badge bg-primary me-2 mb-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Edit/Delete Buttons */}
          <div className="d-flex flex-column align-items-end">
            <button
              className="btn btn-sm btn-danger mb-2"
              onClick={() => handleDeleteCertification(cert.title)}
              style={{ width: "7rem" }}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleEditCertification(index)}
              style={{ width: "7rem" }}
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Certification;
