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

  const [editField, setEditField] = useState(null);
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
    { key: "id", label: "ID" },
    { key: "role", label: "Role" },
    { key: "dob", label: "Date of Birth" },
    { key: "phone", label: "Phone" },
    { key: "personalEmail", label: "Personal Email" },
    { key: "emergencyContact", label: "Emergency Contact" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "address", label: "Address" },
    { key: "yearsOfExperience", label: "Years of Experience" },
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
          console.log("[DEBUG] Fetched profile data:", {
            fullName: data.fullName,
            profilePicture: data.profilePicture ? "base64 string" : "null",
            id: data.id,
            role: data.role,
            bloodGroup: data.bloodGroup,
            personalEmail: data.personalEmail,
            emergencyContact: data.emergencyContact,
          });
          setProfile({
            profilePicture: data.profilePicture || defaultProfile,
            name: data.fullName,
            id: data.id || "not-set",
            role: data.role || "not-set",
            dob: formatDate(data.dateOfBirth),
            phone: data.phone || "not-set",
            personalEmail: data.personalEmail || "not-set",
            emergencyContact: data.emergencyContact || "not-set",
            bloodGroup: data.bloodGroup || "not-set",
            address: data.address || "not-set",
            yearsOfExperience: data.yearsOfExperience || "0",
          });
        } else {
          console.log("[DEBUG] Failed to load profile:", data.message);
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
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
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
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!imageRef || !crop.width || !crop.height) {
      console.log("[DEBUG] Cannot crop: imageRef or crop dimensions missing");
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
            console.log("[DEBUG] Cropped image blob created:", {
              size: blob.size,
              type: blob.type,
            });
            resolve(blob);
          } else {
            console.log("[DEBUG] Failed to create cropped blob");
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
      console.log("[DEBUG] Cropped image URL created:", croppedUrl);
      setCroppedImage(croppedBlob);
      setProfile({ ...profile, profilePicture: croppedUrl });
      setShowCropModal(false);
    } else {
      setError("Failed to crop the image.");
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!croppedImage) {
      console.log("[DEBUG] No cropped image to upload");
      setError("No cropped image to upload.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("profilePicture", croppedImage, "profile.jpg");
      console.log("[DEBUG] Sending profile picture to backend");

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
      console.log("[DEBUG] Update profile response:", {
        ok: response.ok,
        data,
      });

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
          console.log("[DEBUG] Refreshed profile data:", {
            fullName: updatedProfileData.fullName,
            profilePicture: updatedProfileData.profilePicture
              ? "base64 string"
              : "null",
          });
          setProfile({
            profilePicture:
              updatedProfileData.profilePicture || defaultProfile,
            name: updatedProfileData.fullName,
            id: updatedProfileData.id || "not-set",
            role: updatedProfileData.role || "not-set",
            dob: formatDate(updatedProfileData.dateOfBirth),
            phone: updatedProfileData.phone || "not-set",
            personalEmail: updatedProfileData.personalEmail || "not-set",
            emergencyContact: updatedProfileData.emergencyContact || "not-set",
            bloodGroup: updatedProfileData.bloodGroup || "not-set",
            address: updatedProfileData.address || "not-set",
            yearsOfExperience: updatedProfileData.yearsOfExperience || "0",
          });
        } else {
          setError("Failed to refresh profile data.");
        }
      } else {
        console.log("[DEBUG] Failed to update profile picture:", data.message);
        setError(data.message || "Failed to update profile picture.");
      }
    } catch (err) {
      console.error("[ERROR] Updating profile picture:", err.message);
      setError("An error occurred while updating the profile picture.");
    }
  };

  const handleUpdateField = async (key) => {
    console.log("[DEBUG] Updating field:", { key, value: profile[key] });

    let rightKey = key;
    if (key === "name") {
      rightKey = "fullName";
    } else if (key === "dob") {
      rightKey = "dateOfBirth";
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ [rightKey]: profile[key] }),
        }
      );

      const data = await response.json();
      console.log("[DEBUG] Update field response:", { ok: response.ok, data });

      if (response.ok) {
        toast.success("Profile updated successfully!", {
          autoClose: 1000,
        });
        setEditField(null);

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
          console.log("[DEBUG] Refreshed profile data after field update:", {
            fullName: updatedProfileData.fullName,
            profilePicture: updatedProfileData.profilePicture
              ? "base64 string"
              : "null",
          });
          setProfile({
            profilePicture:
              updatedProfileData.profilePicture || defaultProfile,
            name: updatedProfileData.fullName,
            id: updatedProfileData.id || "not-set",
            role: updatedProfileData.role || "not-set",
            dob: formatDate(updatedProfileData.dateOfBirth),
            phone: data.phone || "not-set",
            personalEmail: updatedProfileData.personalEmail || "not-set",
            emergencyContact: updatedProfileData.emergencyContact || "not-set",
            bloodGroup: updatedProfileData.bloodGroup || "not-set",
            address: updatedProfileData.address || "not-set",
            yearsOfExperience: updatedProfileData.yearsOfExperience || "0",
          });
        }
      } else {
        console.log("[DEBUG] Failed to update field:", data.message);
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
            profilePicture:
              data.profilePicture || defaultProfile,
            name: data.fullName,
            id: data.id || "not-set",
            role: data.role || "not-set",
            dob: formatDate(data.dateOfBirth),
            phone: data.phone || "not-set",
            personalEmail: data.personalEmail || "not-set",
            emergencyContact: data.emergencyContact || "not-set",
            bloodGroup: data.bloodGroup || "not-set",
            address: data.address || "not-set",
            yearsOfExperience: data.yearsOfExperience || "0",
          });
        }
      } catch (err) {
        console.error("[ERROR] Refetching profile on cancel:", err.message);
      }
    };

    fetchProfile();
    setEditField(null);
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
                  console.log(
                    "[DEBUG] Image failed to load:",
                    profile.profilePicture
                  );
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
              className="mb-2 text-white"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "1.2rem",
              }}
            >
              {profile.name || "User"}
            </h5>
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
          <h5
            className="mb-3 text-white"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Personal Information
          </h5>
          <div className="row g-3">
            {fieldOrder.map(({ key, label }) => (
              <div className="col-md-6" key={key}>
                <div className="position-relative">
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
                  {editField === key ? (
                    <div className="d-flex gap-2">
                      <input
                        type={key === "dob" ? "date" : key === "yearsOfExperience" ? "number" : "text"}
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
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#db2777")
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = "#7c3aed")
                        }
                      />
                      <button
                        className="btn btn-sm px-3 py-1 d-flex align-items-center"
                        style={{
                          backgroundColor: "#28a745",
                          color: "#fff",
                          fontFamily: "'Roboto', sans-serif",
                          borderRadius: "8px",
                        }}
                        onClick={() => handleUpdateField(key)}
                      >
                        <span className="d-none d-sm-inline me-1">Save</span>
                        <i className="bi bi-check-lg"></i>
                      </button>
                      <button
                        className="btn btn-sm px-3 py-1 d-flex align-items-center"
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          fontFamily: "'Roboto', sans-serif",
                          borderRadius: "8px",
                        }}
                        onClick={handleCancelEdit}
                      >
                        <span className="d-none d-sm-inline me-1">Cancel</span>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="form-control bg-dark text-white d-flex justify-content-between align-items-center"
                      style={{
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        padding: "0.5rem",
                        border: "1px solid #444",
                        borderRadius: "8px",
                        transition: "border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#7c3aed")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#444")
                      }
                    >
                      <span>
                        {profile[key] || (
                          <span className="text-muted">Not updated</span>
                        )}
                      </span>
                      <FaEdit
                        style={{ cursor: "pointer", color: "#7c3aed" }}
                        onClick={() => setEditField(key)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
                          console.log("[DEBUG] Crop image loaded:", {
                            naturalWidth: e.currentTarget.naturalWidth,
                            naturalHeight: e.currentTarget.naturalHeight,
                          });
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