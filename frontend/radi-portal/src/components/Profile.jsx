import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
  const [profile, setProfile] = useState({
    profilePicture: "",
    name: "",
    id: "",
    dob: "",
    phone: "",
    address: "",
    yearsOfExperience: "",
  });

  const [editField, setEditField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ ...profile, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    alert("Profile saved successfully!");
    setEditField(null);
  };

  return (
    <div className="mb-5">
      <h2 className="mb-4">Profile</h2>

      {/* Profile Picture */}
      <div className="mb-4 text-center">
        <div
          className="rounded-circle mb-3"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "#333",
            overflow: "hidden",
            display: "inline-block",
          }}
        >
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              onChange={handleProfilePictureChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

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
                  : key}
              </label>
              {editField === key ? (
                <input
                  type={key === "dob" ? "date" : "text"}
                  id={key}
                  name={key}
                  className="form-control bg-dark text-white"
                  value={profile[key]}
                  onChange={handleInputChange}
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
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
        <button
          className="btn btn-success"
          onClick={handleSaveProfile}
          style={{ width: "10rem" }}
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
