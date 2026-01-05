import React, { useState } from "react";

const Profile = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <div>
      <h2>Profile</h2>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
