import React, { useState, useEffect } from "react";
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
    role: "", // New field added
  });

  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token
          },
        });

        const data = await response.json();
        if (response.ok) {
          setProfile({
            profilePicture:
              data.profilePicture ||
              "https://th.bing.com/th/id/OIP.RKrPgszyZzEt38bVz8yeTQHaHa?w=177&h=180&c=7&r=0&o=5&cb=iwc2&dpr=1.3&pid=1.7", // Use hardcoded image if none exists
            name: data.fullName,
            id: data.id,
            dob: formatDate(data.dateOfBirth), // Format the date
            phone: data.phone,
            address: data.address,
            yearsOfExperience: data.yearsOfExperience,
            role: data.role, // Use category as role
          });
        } else {
          setError(data.message || "Failed to load profile data.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleUpdateField = async (key) => {
    console.log("Updating field:", key, "with value:", profile[key]); // Debugging log

    // Map frontend keys to backend keys
    var rightKey = key;
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
          body: JSON.stringify({ [rightKey]: profile[key] }), // Send the updated field
        }
      );

      const data = await response.json();
      console.log("Response from server:", data); // Debugging log

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setEditField(null);

        // Trigger a refresh by fetching updated profile data
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
            profilePicture:
              updatedProfileData.profilePicture ||
              "https://th.bing.com/th/id/OIP.RKrPgszyZzEt38bVz8yeTQHaHa?w=177&h=180&c=7&r=0&o=5&cb=iwc2&dpr=1.3&pid=1.7", // Use hardcoded image if none exists
            name: updatedProfileData.fullName,
            id: updatedProfileData.id,
            dob: formatDate(updatedProfileData.dateOfBirth), // Format the date
            phone: updatedProfileData.phone,
            address: updatedProfileData.address,
            yearsOfExperience: updatedProfileData.yearsOfExperience,
            role: updatedProfileData.role, // Use category as role
          });
        }
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
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
      <h2 className="mb-4">Profile</h2>

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
              onChange={(e) => handleInputChange(e)}
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
