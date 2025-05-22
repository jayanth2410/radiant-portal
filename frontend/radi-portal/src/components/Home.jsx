import React, { useContext } from "react";
import { UserContext } from "./UserContext";

const Home = () => {
  const { user } = useContext(UserContext);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <p>Email: {user.email}</p>
      <p>{user.role}</p>
     <p>{user.profilePicture}</p>
    </div>
  );
};

export default Home;
