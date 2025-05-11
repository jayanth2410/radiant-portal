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
            <button className="btn btn-primary mt-2" onClick={handleAddSkill}>
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
  );
};

export default Certification;