import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Certification = () => {
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState({
    title: "",
    duration: "",
    skillsObtained: [],
    certificateImage: null, // Stores file for upload
    imagePreview: null, // Stores data URL for preview
  });
  const [newSkill, setNewSkill] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch certifications on mount
  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/certifications",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(
        "[DEBUG] Fetched certifications:",
        response.data.certifications.length
      );
      setCertifications(response.data.certifications || []);
    } catch (error) {
      console.error("[ERROR] Fetching certifications:", error.message);
      toast.error(
        error.response?.data?.message || "Failed to fetch certifications",
        {
          autoClose: 1000,
          theme: "dark",
        }
      );
    }
  };

  const handleAddOrUpdateCertification = async () => {
    if (!newCertification.title || !newCertification.duration) {
      console.log("[DEBUG] Validation failed: Title or duration missing");
      toast.error("Title and duration are required", {
        autoClose: 1000,
        theme: "dark",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newCertification.title);
      formData.append("duration", newCertification.duration);
      formData.append(
        "skillsObtained",
        JSON.stringify(newCertification.skillsObtained)
      );
      if (newCertification.certificateImage) {
        formData.append(
          "certificateImage",
          newCertification.certificateImage,
          "certificate.jpg"
        );
      }

      let response;
      if (editId) {
        // Update certification
        console.log("[DEBUG] Updating certification:", { certId: editId });
        response = await axios.put(
          `http://localhost:5000/api/certifications/${editId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setCertifications(
          certifications.map((cert) =>
            cert._id === editId ? response.data.certification : cert
          )
        );
        toast.success("Certification updated successfully!", {
          autoClose: 1000,
          theme: "dark",
        });
      } else {
        // Create certification
        console.log("[DEBUG] Creating new certification");
        response = await axios.post(
          "http://localhost:5000/api/certifications",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setCertifications([response.data.certification, ...certifications]);
        toast.success("Certification added successfully!", {
          autoClose: 1000,
          theme: "dark",
        });
      }

      resetForm();
    } catch (error) {
      console.error("[ERROR] Saving certification:", error.message);
      toast.error(
        error.response?.data?.message || "Failed to save certification",
        {
          autoClose: 1000,
          theme: "dark",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertification = async (certId, title) => {
    const confirmation = prompt(
      `To delete the certification, type its name: "${title}"`
    );
    if (confirmation !== title) {
      console.log("[DEBUG] Deletion canceled: Name mismatch");
      toast.error("Certification name did not match. Deletion canceled.", {
        autoClose: 1000,
        theme: "dark",
      });
      return;
    }

    try {
      console.log("[DEBUG] Deleting certification:", { certId });
      await axios.delete(`http://localhost:5000/api/certifications/${certId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCertifications(certifications.filter((cert) => cert._id !== certId));
      toast.success("Certification deleted successfully!", {
        autoClose: 1000,
        theme: "dark",
      });
    } catch (error) {
      console.error("[ERROR] Deleting certification:", error.message);
      toast.error(
        error.response?.data?.message || "Failed to delete certification",
        {
          autoClose: 1000,
          theme: "dark",
        }
      );
    }
  };

  const handleEditCertification = (cert) => {
    console.log("[DEBUG] Editing certification:", { certId: cert._id });
    setNewCertification({
      title: cert.title,
      duration: cert.duration,
      skillsObtained: cert.skillsObtained,
      certificateImage: null,
      imagePreview: cert.certificateImage
        ? `data:image/jpeg;base64,${cert.certificateImage}`
        : null,
    });
    setEditId(cert._id);
    setShowModal(true);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setNewCertification({
        ...newCertification,
        skillsObtained: [...newCertification.skillsObtained, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index) => {
    setNewCertification({
      ...newCertification,
      skillsObtained: newCertification.skillsObtained.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("[DEBUG] File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      const reader = new FileReader();
      reader.onload = () => {
        setNewCertification({
          ...newCertification,
          certificateImage: file, // Store file for upload
          imagePreview: reader.result, // Store data URL for preview
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewCertification({
      title: "",
      duration: "",
      skillsObtained: [],
      certificateImage: null,
      imagePreview: null,
    });
    setNewSkill("");
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="container">
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
      <h2
        className="mb-4 text-white fw-bold"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <i class="bi bi-patch-check-fill"></i> Certifications
      </h2>

      {/* Add Certification Button */}
      <div className="text-center mb-4">
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#7c3aed", border: "none" }}
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Certification
        </button>
      </div>

      {/* No Certifications Placeholder */}
      {certifications.length === 0 && (
        <div
          className="d-flex flex-column align-items-center justify-content-center text-white"
          style={{
            backgroundColor: "#333",
            borderRadius: "10px",
            padding: "3rem",
          }}
        >
          <i
            className="bi bi-file-earmark-text"
            style={{ fontSize: "3rem", color: "#7c3aed" }}
          ></i>
          <p className="mt-3">No certifications added yet.</p>
        </div>
      )}

      {/* Certifications List */}
      <div className="row">
        {certifications.map((cert) => (
          <div key={cert._id} className="col-md-6 col-lg-4 mb-4">
            <div
              className="card bg-dark text-white h-100"
              style={{ borderRadius: "10px" }}
            >
              {cert.certificateImage && (
                <img
                  src={`data:image/jpeg;base64,${cert.certificateImage}`}
                  alt={cert.title}
                  className="card-img-top"
                  style={{
                    width: "100%",
                    maxHeight: "300px", // Allow larger images
                    objectFit: "contain", // Show full image
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                  }}
                  onError={(e) => {
                    console.log(
                      "[DEBUG] Image failed to load:",
                      cert.certificateImage
                    );
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=Error";
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{cert.title}</h5>
                <p className="card-text text">Duration: {cert.duration}</p>
                <div className="d-flex flex-wrap gap-2">
                  {cert.skillsObtained.map((skill, index) => (
                    <span key={index} className="badge bg-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => handleEditCertification(cert)}
                >
                  <i className="bi bi-pencil"></i> Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() =>
                    handleDeleteCertification(cert._id, cert.title)
                  }
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Certification */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editId ? "Edit Certification" : "Add Certification"}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={resetForm}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="certTitle" className="form-label">
                    Title
                  </label>
                  <input
                    id="certTitle"
                    type="text"
                    className="form-control bg-dark text-white"
                    value={newCertification.title}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Java Certification"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="certDuration" className="form-label">
                    Duration
                  </label>
                  <input
                    id="certDuration"
                    type="text"
                    className="form-control bg-dark text-white"
                    value={newCertification.duration}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        duration: e.target.value,
                      })
                    }
                    placeholder="e.g., 2 months"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="certImage" className="form-label">
                    Certificate Image
                  </label>
                  <input
                    id="certImage"
                    type="file"
                    className="form-control bg-dark text-white"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {newCertification.imagePreview && (
                    <img
                      src={newCertification.imagePreview}
                      alt="Preview"
                      className="mt-2"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                        borderRadius: "5px",
                      }}
                    />
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="certSkill" className="form-label">
                    Skills Obtained
                  </label>
                  <div className="input-group">
                    <input
                      id="certSkill"
                      type="text"
                      className="form-control bg-dark text-white"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., Java"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleAddSkill}
                    >
                      Add
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {newCertification.skillsObtained.map((skill, index) => (
                      <span
                        key={index}
                        className="badge bg-secondary d-flex align-items-center"
                      >
                        {skill}
                        <button
                          className="btn-close btn-close-white ms-2"
                          onClick={() => handleRemoveSkill(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddOrUpdateCertification}
                  disabled={loading}
                >
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

export default Certification;
