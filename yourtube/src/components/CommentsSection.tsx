import React from "react";

const CommentsSection = () => {
  return (
    <div
      id="comments-section"
      className="comments-section"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "40vh",
        background: "var(--background)",
        color: "var(--foreground)",
        overflowY: "auto",
        borderTop: "2px solid #ccc",
        padding: "16px",
        display: "none",
        zIndex: 50,
      }}
    >
      <h3 className="text-xl font-semibold mb-2">Comments</h3>
      <p className="text-base">All comments will appear here...</p>
    </div>
  );
};

export default CommentsSection;
