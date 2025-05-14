import React, { useState, useEffect, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    profilePicture: "",
    name: "",
    id: "",
    dob: "",
    phone: "",
    address: "",
    yearsOfExperience: "",
    role: "",
  });

  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 200, // Increased for better quality
    height: 200,
    aspect: 1,
    x: 0,
    y: 0,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageRef, setImageRef] = useState(null);

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
          });
          setProfile({
            profilePicture:
              data.profilePicture ||
              "https://via.placeholder.com/100?text=No+Image",
            name: data.fullName,
            id: data.id,
            dob: formatDate(data.dateOfBirth),
            phone: data.phone,
            address: data.address,
            yearsOfExperience: data.yearsOfExperience,
            role: data.role,
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
    const targetSize = 200; // Increased for better quality
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");

    // Improve rendering quality
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
        1.0 // Maximum quality
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
        setSuccess("Profile picture updated successfully!");
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
              updatedProfileData.profilePicture ||
              "https://via.placeholder.com/100?text=No+Image",
            name: updatedProfileData.fullName,
            id: updatedProfileData.id,
            dob: formatDate(updatedProfileData.dateOfBirth),
            phone: updatedProfileData.phone,
            address: updatedProfileData.address,
            yearsOfExperience: updatedProfileData.yearsOfExperience,
            role: updatedProfileData.role,
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
        setSuccess("Profile updated successfully!");
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
              updatedProfileData.profilePicture ||
              "https://via.placeholder.com/100?text=No+Image",
            name: updatedProfileData.fullName,
            id: updatedProfileData.id,
            dob: formatDate(updatedProfileData.dateOfBirth),
            phone: updatedProfileData.phone,
            address: updatedProfileData.address,
            yearsOfExperience: updatedProfileData.yearsOfExperience,
            role: updatedProfileData.role,
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
    <div className="mb-5">
      <h2 className="mb-4 text-white">Profile</h2>

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* Profile Picture */}
      <div className="mb-4 text-center">
        <div
          className="rounded-circle mb-3"
          style={{
            width: "100px",
            height: "100px",
            overflow: "hidden",
            backgroundColor: "#333",
            display: "inline-block",
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
              }}
              onError={(e) => {
                console.log("[DEBUG] Image failed to load:", profile.profilePicture);
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
                fontSize: "0.9rem",
              }}
            >
              Not Updated
            </div>
          )}
        </div>
        <div>
          <label className="btn btn-primary btn-sm">
            Upload Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          {croppedImage && (
            <button
              className="btn btn-success btn-sm ms-2"
              onClick={handleUpdateProfilePicture}
            >
              Update Profile Picture
            </button>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Crop Image</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCropModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedImage && (
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    circularCrop
                    aspect={1}
                    keepSelection
                  >
                    <img
                      src={selectedImage}
                      alt="Crop"
                      onLoad={(e) => {
                        console.log("[DEBUG] Crop image loaded:", {
                          naturalWidth: e.currentTarget.naturalWidth,
                          naturalHeight: e.currentTarget.naturalHeight,
                        });
                        setImageRef(e.currentTarget);
                      }}
                    />
                  </ReactCrop>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCropComplete}
                >
                  Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Form */}
      <div className="card bg-dark text-white p-4">
        {Object.keys(profile)
          .filter((key) => key !== "profilePicture")
          .map((key) => (
            <div className="mb-3 position-relative" key={key}>
              <label htmlFor={key} className="form-label text-capitalize">
                {key === "dob"
                  ? "Date of Birth"
                  : key === "yearsOfExperience"
                  ? "Years of Experience"
                  : key === "role"
                  ? "Role"
                  : key}
              </label>
              {editField === key ? (
                <div className="d-flex">
                  <input
                    type={key === "dob" ? "date" : "text"}
                    id={key}
                    name={key}
                    className="form-control bg-dark text-white"
                    value={profile[key]}
                    onChange={handleInputChange}
                  />
                  <button
                    className="btn btn-success ms-2"
                    onClick={() => handleUpdateField(key)}
                  >
                    Update
                  </button>
                </div>
              ) : (
                <div
                  className="form-control bg-dark text-white d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    {profile[key] || (
                      <span className="text-muted">Not updated</span>
                    )}
                  </span>
                  <FaEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => setEditField(key)}
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Profile;