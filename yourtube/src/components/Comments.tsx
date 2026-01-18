"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Comment {
  _id: string;
  text: string;
  city: string;
  likes: number;
  dislikes: number;
  userId?: string;
  createdAt: string;
}

const Comments = ({ videoId }: { videoId: string }) => {
  const { user } = useUser();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState("en");

  /* ===============================
     LOAD COMMENTS
     =============================== */
  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Load comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     POST COMMENT
     =============================== */
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    // Client-side validation for special characters
    const regex = /^[\p{L}\p{N}\s.,!?'-]+$/u;
    if (!regex.test(newComment)) {
      alert("Comments cannot contain special characters (like @, #, $, etc.)");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/comment/postcomment", {
        text: newComment,
        videoId,
        userId: user._id,
        language: "auto",
      });

      setNewComment("");
      fetchComments();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===============================
     TRANSLATE COMMENT
     =============================== */
  const translateComment = async (id: string, text: string) => {
    try {
      const res = await axiosInstance.post("/comment/translate", {
        text,
        targetLang: lang,
      });

      setComments((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, text: res.data.translatedText } : c
        )
      );
    } catch (error) {
      console.error("Translate error:", error);
    }
  };

  /* ===============================
     LIKE / DISLIKE
     =============================== */
  const likeComment = async (id: string) => {
    await axiosInstance.post(`/comment/like/${id}`);
    fetchComments();
  };

  const dislikeComment = async (id: string) => {
    await axiosInstance.post(`/comment/dislike/${id}`);
    fetchComments(); // comment may auto-delete
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ru", name: "Russian" },
  ];

  return (
    <div className="space-y-6 mt-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{comments.length} Comments</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Translate to:</span>
          <select
            className="border rounded-md p-1.5 text-sm bg-background cursor-pointer focus:ring-2 focus:ring-primary outline-none"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ADD COMMENT */}
      {user ? (
        <div className="flex gap-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
          <Avatar className="w-12 h-12 shadow-sm">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Add a comment... (Any language allowed, no special chars)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-base resize-none"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-6 rounded-full font-semibold transition-all hover:scale-105 active:scale-95"
              >
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-secondary/10 rounded-xl text-center">
          <p className="text-sm text-gray-500">Please sign in to join the conversation.</p>
        </div>
      )}

      {/* COMMENTS LIST */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
            <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="group flex gap-4 p-2 rounded-xl transition-colors hover:bg-secondary/10">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarFallback className="bg-gray-200">U</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm hover:underline cursor-pointer">User</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full font-medium text-gray-600 flex items-center gap-1">
                    <span className="text-xs">📍</span> {comment.city}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-foreground/90">{comment.text}</p>

                <div className="flex items-center gap-4 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-green-100 hover:text-green-600"
                      onClick={() => likeComment(comment._id)}
                    >
                      <span className="text-sm">👍</span>
                    </Button>
                    <span className="text-xs font-medium">{comment.likes}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600"
                      onClick={() => dislikeComment(comment._id)}
                    >
                      <span className="text-sm">👎</span>
                    </Button>
                    <span className="text-xs font-medium">{comment.dislikes}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="link"
                    className="h-auto p-0 text-primary hover:text-primary/80 font-semibold text-xs transition-colors"
                    onClick={() => translateComment(comment._id, comment.text)}
                  >
                    Translate
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
