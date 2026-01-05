export default function PostCard({ post }) {
  return (
    <div style={{ background: "#fff", padding: "10px", marginBottom: "10px" }}>
      <h4>{post.username}</h4>
      <p>{post.caption}</p>
    </div>
  );
}
