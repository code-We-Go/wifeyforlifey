"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThumbsUp, Reply, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VideoComment, VideoReply } from "@/app/interfaces/interfaces";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import mongoose from "mongoose";

interface CommentSectionProps {
  videoId: string;
}

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newReplies, setNewReplies] = useState<{ [key: string]: string }>({});
  const [videoLikes, setVideoLikes] = useState<mongoose.Types.ObjectId[]>([]);
  const [videoLikesCount, setVideoLikesCount] = useState(0);

  // Fetch comments and video likes for the video
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch comments
        const commentsResponse = await axios.get(
          `/api/videos/${videoId}/comments`
        );
        setComments(commentsResponse.data.comments || []);

        // Fetch video details to get likes
        const videoResponse = await axios.get(`/api/videos/${videoId}`);
        if (videoResponse.data.video) {
          setVideoLikes(videoResponse.data.video.likes || []);
          setVideoLikesCount((videoResponse.data.video.likes || []).length);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  // Submit a new comment
  const handleCommentSubmit = async () => {
    if (!session?.user) {
      setError("You must be logged in to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/videos/${videoId}/comments`, {
        text: newComment.trim(),
      });

      // Add the new comment to the list
      const newCommentData = response.data.comment as VideoComment;
      setComments([newCommentData, ...comments]);
      setNewComment("");
    } catch (err: any) {
      // Display the actual error message from the API if available
      const errorMessage =
        err.response?.data?.error || "Failed to post comment";
      setError(errorMessage);
      // console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle like on a comment
  const handleLikeComment = async (commentId: string) => {
    if (!session?.user) {
      setError("You must be logged in to like comments");
      return;
    }

    try {
      // Update the comments state to reflect the like
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            const userId = session.user.id;
            const alreadyLiked =
              userId &&
              comment.likes?.some((like) =>
                typeof like === "object" && like._id
                  ? like._id.toString() === userId
                  : like.toString() === userId
              );

            return {
              ...comment,
              likes: alreadyLiked
                ? comment.likes?.filter((like) =>
                    typeof like === "object" && like._id
                      ? like._id.toString() !== userId
                      : like.toString() !== userId
                  )
                : [...(comment.likes || []), userId],
            } as VideoComment;
          }
          return comment;
        })
      );
      await axios.post(`/api/videos/${videoId}/comments/${commentId}/likes/`);
    } catch (err) {
      setError("Failed to like comment");
      console.error("Error liking comment:", err);
    }
  };

  // Submit a reply to a comment
  const handleReplySubmit = async (commentId: string) => {
    if (!session?.user) {
      setError("You must be logged in to reply");
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    try {
      const response = await axios.post(
        `/api/videos/${videoId}/comments/${commentId}/replies`,
        {
          text: replyText.trim(),
        }
      );

      // Cast the reply to VideoReply type
      const newReply = response.data.reply as VideoReply;

      // Update the comments state to include the new reply
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        })
      );

      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      setError("Failed to post reply");
      console.error("Error posting reply:", err);
    }
  };

  // Toggle like on a reply
  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!session?.user) {
      setError("You must be logged in to like replies");
      return;
    }

    try {
      // Update the comments state to reflect the like on the reply
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) => {
                if (reply._id === replyId) {
                  const userId = session.user.id;
                  const alreadyLiked = userId && reply.likes?.includes(userId);

                  return {
                    ...reply,
                    likes: alreadyLiked
                      ? reply.likes?.filter((id) => id !== userId)
                      : [...(reply.likes || []), userId],
                  } as VideoReply;
                }
                return reply;
              }),
            } as VideoComment;
          }
          return comment;
        })
      );
      await axios.post(
        `/api/videos/${videoId}/comments/${commentId}/replies/${replyId}/likes`
      );
    } catch (err) {
      setError("Failed to like reply");
      console.error("Error liking reply:", err);
    }
  };

  // Toggle like on the video
  const handleLikeVideo = async () => {
    if (!session?.user) {
      setError("You must be logged in to like videos");
      return;
    }

    try {
      // Update the video likes state
      const userId = session.user.id;
      if (userId) {
        const alreadyLiked = videoLikes.some((id) => id.toString() === userId);

        if (alreadyLiked) {
          setVideoLikes(videoLikes.filter((id) => id.toString() !== userId));
          setVideoLikesCount((prev) => prev - 1);
        } else {
          setVideoLikes([...videoLikes, new mongoose.Types.ObjectId(userId)]);
          setVideoLikesCount((prev) => prev + 1);
        }
      }
      await axios.post(`/api/videos/${videoId}/likes/`);
    } catch (err) {
      setError("Failed to like video");
      console.error("Error liking video:", err);
    }
  };

  // Toggle expanded state for a comment
  const toggleCommentExpanded = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Toggle expanded state for replies
  const toggleRepliesExpanded = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading && comments.length === 0) {
    return (
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-medium">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-10 w-10 rounded-full bg-lovely/20"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 rounded bg-lovely/20"></div>
                <div className="h-4 w-3/4 rounded bg-lovely/20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-lovely">Comments</h3>
        <button
          onClick={handleLikeVideo}
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            session?.user &&
            session.user.id &&
            videoLikes.some((id) => id.toString() === session.user.id)
              ? "bg-lovely text-creamey"
              : "bg-creamey text-lovely border border-lovely"
          }`}
          disabled={!session?.user}
        >
          <ThumbsUp
            className={`h-4 w-4 ${
              session?.user &&
              session.user.id &&
              videoLikes.some((id) => id.toString() === session.user.id)
                ? "fill-creamey"
                : ""
            }`}
          />
          <span>{videoLikesCount}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Comment input */}
      {session?.user ? (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || ""}
            />
            <AvatarFallback>
              {getInitials(session.user.name || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-creamey text-lovely placeholder:text-lovely/50"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCommentSubmit}
                disabled={loading || !newComment.trim()}
                className="bg-lovely text-creamey hover:bg-lovely/90"
              >
                <Send className="mr-2 h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-creamey text-lovely rounded-md">
          <p>
            Please{" "}
            <a href="/login" className="underline">
              sign in
            </a>{" "}
            to comment.
          </p>
        </div>
      )}

      <Separator className="my-6" />

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => {
            const isExpanded = expandedComments[comment._id || ""] || false;
            const repliesExpanded = expandedReplies[comment._id || ""] || false;
            const isLikedByUser =
              session?.user &&
              session.user.id &&
              comment.likes?.some((like) =>
                typeof like === "object" && like._id
                  ? like._id.toString() === session.user.id
                  : like.toString() === session.user.id
              );

            return (
              <div key={comment._id} className="space-y-3">
                <div className="flex gap-4">
                  {/* <img
                    className="w-16 h-16 rounded-full"
                    src={comment.userId.imageURL!}
                  ></img> */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={comment.userImage || ""}
                      alt={comment.username}
                    />
                    <AvatarFallback>
                      {getInitials(
                        `${comment.firstName || comment.username} ${
                          comment.lastName || ""
                        }`
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lovely">
                        {`${comment.firstName || comment.username} ${
                          comment.lastName
                        }`}
                      </h4>
                      <span className="text-xs text-lovely/60">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-lovely/80 ${
                        !isExpanded && "line-clamp-3"
                      }`}
                    >
                      {comment.text}
                    </p>
                    {comment.text.length > 150 && (
                      <button
                        onClick={() => toggleCommentExpanded(comment._id || "")}
                        className="text-sm text-lovely/60 hover:text-lovely mt-1"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLikeComment(comment._id || "")}
                        className={`flex items-center text-sm ${
                          isLikedByUser
                            ? "text-lovely"
                            : "text-lovely/60 hover:text-lovely"
                        }`}
                        disabled={!session?.user}
                      >
                        <ThumbsUp
                          className={`mr-1 h-4 w-4 ${
                            isLikedByUser ? "fill-lovely" : ""
                          }`}
                        />
                        {comment.likes?.length || 0}
                      </button>
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment._id
                              ? null
                              : comment._id || ""
                          )
                        }
                        className="flex items-center text-sm text-lovely/60 hover:text-lovely"
                        disabled={!session?.user}
                      >
                        <Reply className="mr-1 h-4 w-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <div className="ml-14 mt-2">
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Add a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[60px] bg-creamey text-lovely placeholder:text-lovely/50"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                          className="border-lovely text-lovely hover:bg-lovely/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleReplySubmit(comment._id || "")}
                          disabled={!replyText.trim()}
                          className="bg-lovely text-creamey hover:bg-lovely/90"
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-14 space-y-3">
                    <button
                      onClick={() => toggleRepliesExpanded(comment._id || "")}
                      className="flex items-center text-sm text-lovely/70 hover:text-lovely"
                    >
                      {repliesExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-4 w-4" />
                          Hide {comment.replies.length}{" "}
                          {comment.replies.length === 1 ? "reply" : "replies"}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-4 w-4" />
                          View {comment.replies.length}{" "}
                          {comment.replies.length === 1 ? "reply" : "replies"}
                        </>
                      )}
                    </button>

                    {repliesExpanded && (
                      <div className="space-y-3 mt-2">
                        {comment.replies.map((reply, index) => {
                          const isReplyLikedByUser =
                            session?.user &&
                            session.user.id &&
                            reply.likes?.includes(session.user.id);

                          return (
                            <div
                              key={reply._id || `reply-${comment._id}-${index}`}
                              className="flex gap-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(reply.username)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm text-lovely">
                                    {reply.username}
                                  </h5>
                                  <span className="text-xs text-lovely/60">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-lovely/80">
                                  {reply.text}
                                </p>
                                <button
                                  onClick={() =>
                                    handleLikeReply(
                                      comment._id || "",
                                      reply._id || ""
                                    )
                                  }
                                  className={`flex items-center text-xs mt-1 ${
                                    isReplyLikedByUser
                                      ? "text-lovely"
                                      : "text-lovely/60 hover:text-lovely"
                                  }`}
                                  disabled={!session?.user}
                                >
                                  <ThumbsUp
                                    className={`mr-1 h-3 w-3 ${
                                      isReplyLikedByUser ? "fill-lovely" : ""
                                    }`}
                                  />
                                  {reply.likes?.length || 0}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-lovely/70">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
