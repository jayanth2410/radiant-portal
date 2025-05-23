import React, { useState, useEffect, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast, ToastContainer } from "react-toastify";
import defaultProfile from "../assets/default-profile.jpg"; // Default profile image

const Profile = () => {
  const [profile, setProfile] = useState({
    profilePicture: "",
    name: "",
    id: "",
    role: "",
    dob: "",
    phone: "",
    personalEmail: "",
    emergencyContact: "",
    bloodGroup: "",
    address: "",
    yearsOfExperience: "",
  });

  const [isEditing, setIsEditing] = useState(false); // New state for edit mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 150,
    height: 150,
    aspect: 1,
    x: 0,
    y: 0,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageRef, setImageRef] = useState(null);

  // Define field order and display labels
  const fieldOrder = [
    { key: "personalEmail", label: "Personal Email", type: "email" },
    { key: "dob", label: "Date of Birth", type: "date" },
    { key: "phone", label: "Phone", type: "text" },

    { key: "emergencyContact", label: "Emergency Contact", type: "text" },
    { key: "bloodGroup", label: "Blood Group", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "yearsOfExperience", label: "Years of Experience", type: "number" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setProfile({
            profilePicture: data.profilePicture || defaultProfile,
            name: data.fullName || "",
            id: data.id || "",
            role: data.role || "",
            dob: data.dateOfBirth ? formatDate(data.dateOfBirth) : "",
            phone: data.phone || "",
            personalEmail: data.personalEmail || "",
            emergencyContact: data.emergencyContact || "",
            bloodGroup: data.bloodGroup || "",
            address: data.address || "",
            yearsOfExperience: data.yearsOfExperience || "",
          });
        } else {
          setError(data.message || "Failed to load profile data.");
        }
      } catch (err) {
        console.error("[ERROR] Fetching profile:", err.message);
        setError("An error occurred while fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Changed to YYYY-MM-DD for input type="date"
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!imageRef || !crop.width || !crop.height) {
      return null;
    }

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    const targetSize = 200;
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      targetSize,
      targetSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(null);
          }
        },
        "image/jpeg",
        1.0
      );
    });
  }, [imageRef, crop]);

  const handleCropComplete = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setCroppedImage(croppedBlob);
      setProfile({ ...profile, profilePicture: croppedUrl });
      setShowCropModal(false);
    } else {
      setError("Failed to crop the image.");
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!croppedImage) {
      setError("No cropped image to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("profilePicture", croppedImage, "profile.jpg");

      const response = await fetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile picture updated successfully!", {
          autoClose: 1000,
        });
        setCroppedImage(null);

        const updatedProfileResponse = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedProfileData = await updatedProfileResponse.json();
        if (updatedProfileResponse.ok) {
          setProfile({
            profilePicture: updatedProfileData.profilePicture || defaultProfile,
            name: updatedProfileData.fullName || "",
            id: updatedProfileData.id || "",
            role: updatedProfileData.role || "",
            dob: updatedProfileData.dateOfBirth
              ? formatDate(updatedProfileData.dateOfBirth)
              : "",
            phone: updatedProfileData.phone || "",
            personalEmail: updatedProfileData.personalEmail || "",
            emergencyContact: updatedProfileData.emergencyContact || "",
            bloodGroup: updatedProfileData.bloodGroup || "",
            address: updatedProfileData.address || "",
            yearsOfExperience: updatedProfileData.yearsOfExperience || "",
          });
        } else {
          setError("Failed to refresh profile data.");
        }
      } else {
        setError(data.message || "Failed to update profile picture.");
      }
    } catch (err) {
      console.error("[ERROR] Updating profile picture:", err.message);
      setError("An error occurred while updating the profile picture.");
    }
  };

  const handleUpdateProfile = async () => {
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Only validate phone if not empty
    if (profile.phone && !mobileRegex.test(profile.phone)) {
      toast.error(
        "Invalid mobile number format. Must start with 6-9 and be 10 digits long.",
        { autoClose: 3000 }
      );
      return;
    }

    // Only validate email if not empty
    if (profile.personalEmail && !emailRegex.test(profile.personalEmail)) {
      toast.error("Invalid email format.", { autoClose: 3000 });
      return;
    }

    let dobToSend = null;
    if (profile.dob) {
      dobToSend = new Date(profile.dob).toISOString();
    }

    const updates = {
      fullName: profile.name,
      phone: profile.phone,
      dateOfBirth: dobToSend, // Will be null if empty
      personalEmail: profile.personalEmail,
      emergencyContact: profile.emergencyContact,
      bloodGroup: profile.bloodGroup,
      address: profile.address,
      yearsOfExperience: profile.yearsOfExperience,
    };

    // Only add dateOfBirth if valid
    if (profile.dob) {
      const date = new Date(profile.dob);
      if (!isNaN(date.getTime())) {
        updates.dateOfBirth = date.toISOString();
      }
    }

    // Only add role if not empty or not 'not-set'
    if (profile.role && profile.role !== "not-set") {
      updates.role = profile.role;
    }

    // Only add id if not empty or not 'not-set'
    if (profile.id && profile.id !== "not-set") {
      updates.id = profile.id;
    }

    // Remove undefined fields (including dateOfBirth if not set)
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!", {
          autoClose: 1000,
        });
        setIsEditing(false);

        const updatedProfileResponse = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const updatedProfileData = await updatedProfileResponse.json();
        if (updatedProfileResponse.ok) {
          setProfile({
            profilePicture: updatedProfileData.profilePicture || defaultProfile,
            name: updatedProfileData.fullName || "",
            id: updatedProfileData.id || "",
            role: updatedProfileData.role || "",
            dob: updatedProfileData.dateOfBirth
              ? formatDate(updatedProfileData.dateOfBirth)
              : "",
            phone: updatedProfileData.phone || "",
            personalEmail: updatedProfileData.personalEmail || "",
            emergencyContact: updatedProfileData.emergencyContact || "",
            bloodGroup: updatedProfileData.bloodGroup || "",
            address: updatedProfileData.address || "",
            yearsOfExperience: updatedProfileData.yearsOfExperience || "",
          });
        } else {
          setError("Failed to refresh profile data.");
        }
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("[ERROR] Updating profile:", err.message);
      setError("An error occurred while updating the profile.");
    }
  };

  const handleCancelEdit = () => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setProfile({
            profilePicture: data.profilePicture || defaultProfile,
            name: data.fullName || "",
            id: data.id || "",
            role: data.role || "",
            dob: data.dateOfBirth ? formatDate(data.dateOfBirth) : "",
            phone: data.phone || "",
            personalEmail: data.personalEmail || "",
            emergencyContact: data.emergencyContact || "",
            bloodGroup: data.bloodGroup || "",
            address: data.address || "",
            yearsOfExperience: data.yearsOfExperience || "",
          });
        }
      } catch (err) {
        console.error("[ERROR] Refetching profile on cancel:", err.message);
      }
    };

    fetchProfile();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="mb-4 text-white fw-bold"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <i className="bi bi-person-fill"></i>
        My Profile
      </h2>

      {/* Toast Container */}
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

      {/* Profile Picture Card */}
      <div
        className="card bg-dark text-white mb-4 shadow-lg"
        style={{
          border: "none",
          background: "linear-gradient(135deg, #1f1f1f 0%, #2c2c2c 100%)",
          borderRadius: "12px",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <div className="card-body p-4 d-flex align-items-center flex-wrap gap-3">
          <div
            className="rounded-circle position-relative"
            style={{
              width: "100px",
              height: "100px",
              overflow: "hidden",
              backgroundColor: "#333",
              border: "3px solid transparent",
              backgroundImage: "linear-gradient(45deg, #7c3aed, #db2777)",
              padding: "2px",
            }}
          >
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                  backgroundColor: "#333",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/100?text=Error";
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#fff",
                  fontSize: "0.8rem",
                  textAlign: "center",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                Not Updated
              </div>
            )}
          </div>
          <div className="d-flex flex-column">
            <h5
              className="mb-1 text-white"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "1.2rem",
              }}
            >
              {profile.name || "User"}
            </h5>
            <div
              className="mb-1"
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "0.95rem",
                color: "#bdbdbd",
                lineHeight: 1.2,
              }}
            >
              <div>{profile.id && <span>ID: {profile.id}</span>}</div>
              <div>{profile.role && <span>Role: {profile.role}</span>}</div>
            </div>
            <div className="d-flex gap-2">
              <label
                className="btn btn-sm px-3 py-1"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#6b32cc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#7c3aed")
                }
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
              {croppedImage && (
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
                  onClick={handleUpdateProfilePicture}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#218838")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#28a745")
                  }
                >
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div
        className="card bg-dark text-white shadow-lg"
        style={{
          border: "1px solid #444",
          borderRadius: "12px",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              className="text-white"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Personal Information
            </h5>
            {!isEditing && (
              <button
                className="btn btn-sm px-3 py-1 d-flex align-items-center"
                style={{
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  fontFamily: "'Roboto', sans-serif",
                  borderRadius: "8px",
                }}
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="me-1" /> Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="row g-3">
              {fieldOrder.map(({ key, label, type }) => (
                <div className="col-md-6" key={key}>
                  <label
                    htmlFor={key}
                    className="form-label text-capitalize small mb-1"
                    style={{
                      color: "#e2e8f0",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </label>
                  {key === "dob" ? ( // Special handling for date of birth
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      className="form-control bg-dark text-white"
                      value={profile.dob || ""}
                      onChange={handleInputChange}
                      placeholder="dd-mm-yyyy"
                    />
                  ) : (
                    <input
                      type={type}
                      id={key}
                      name={key}
                      className="form-control bg-dark text-white"
                      value={profile[key]}
                      onChange={handleInputChange}
                      style={{
                        fontSize: "0.9rem",
                        padding: "0.5rem",
                        border: "1px solid #7c3aed",
                        borderRadius: "8px",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#db2777")}
                      onBlur={(e) => (e.target.style.borderColor = "#7c3aed")}
                    />
                  )}
                </div>
              ))}
              <div className="col-12 mt-4">
                <button
                  className="btn btn-sm px-3 py-1 me-2"
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    borderRadius: "8px",
                  }}
                  onClick={handleUpdateProfile}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm px-3 py-1"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    borderRadius: "8px",
                  }}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {fieldOrder.map(({ key, label }) => (
                <div className="col-md-6" key={key}>
                  <label
                    htmlFor={key}
                    className="form-label text-capitalize small mb-1"
                    style={{
                      color: "#e2e8f0",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </label>
                  <div
                    className="form-control bg-dark text-white"
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem",
                      border: "1px solid #444",
                      borderRadius: "8px",
                    }}
                  >
                    {profile[key] || (
                      <span className="text-muted">Not updated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "350px" }}
          >
            <div
              className="modal-content bg-dark text-white"
              style={{ borderRadius: "12px" }}
            >
              <div className="modal-header border-0">
                <h5
                  className="modal-title"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.1rem",
                  }}
                >
                  Crop Image
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCropModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: "1rem" }}>
                {selectedImage && (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      margin: "0 auto",
                    }}
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={(newCrop) => setCrop(newCrop)}
                      circularCrop
                      aspect={1}
                      keepSelection
                      style={{ width: "100%", height: "auto" }}
                    >
                      <img
                        src={selectedImage}
                        alt="Crop"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          display: "block",
                        }}
                        onLoad={(e) => {
                          setImageRef(e.currentTarget);
                        }}
                      />
                    </ReactCrop>
                  </div>
                )}
              </div>
              <div
                className="modal-footer border-0"
                style={{ padding: "0.5rem 1rem" }}
              >
                <button
                  className="btn btn-sm px-2 py-1"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.8rem",
                    borderRadius: "8px",
                  }}
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm px-2 py-1"
                  style={{
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.8rem",
                    borderRadius: "8px",
                  }}
                  onClick={handleCropComplete}
                >
                  Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
