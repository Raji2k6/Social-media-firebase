import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#222", color: "#fff" }}>
      <Link to="/" style={{ marginRight: "10px" }}>Feed</Link>
      <Link to="/create" style={{ marginRight: "10px" }}>Create</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}
