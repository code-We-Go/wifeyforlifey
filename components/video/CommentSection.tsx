"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ThumbsUp,
  Reply,
  Send,
  ChevronDown,
  ChevronUp,
  Heart,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VideoComment, VideoReply } from "@/app/interfaces/interfaces";
import axios from "axios";
// Configure axios with longer timeout to prevent timeout errors
import { formatDistanceToNow } from "date-fns";
import mongoose from "mongoose";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
// axios.defaults.timeout = 30000; // 30 seconds timeout

interface CommentSectionProps {
  videoId: string;
}

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
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
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likeUsers, setLikeUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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

    if (!session?.user.isSubscribed) {
      setError("You must be subscribed to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/videos/${videoId}/comments`, {
        text: newComment.trim(),
        parentId: videoId,
        parentType: "video",
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

    if (!session?.user.isSubscribed) {
      setError("You must be subscribed to like comments");
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
      await axios.post(`/api/videos/${videoId}/comments/${commentId}/likes/`, {
        parentId: videoId,
        parentType: "video",
      });
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

    if (!session?.user.isSubscribed) {
      setError("You must be subscribed to reply");
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    try {
      // Set loading state for this specific comment
      setReplyLoading(commentId);

      const response = await axios.post(
        `/api/videos/${videoId}/comments/${commentId}/replies`,
        {
          text: replyText.trim(),
        }
      );

      // Cast the reply to VideoReply type and ensure it matches the structure of VideoComment
      const newReply = response.data.reply as VideoReply;

      // Enhance the reply with user data to match VideoComment structure
      const enhancedReply = {
        ...newReply,
        userId:
          typeof newReply.userId === "string"
            ? {
                _id: newReply.userId,
                username: session?.user?.name || newReply.username,
                firstName: session?.user?.firstName || "",
                lastName: session?.user?.lastName || "",
                imageURL: session?.user?.image || "",
              }
            : newReply.userId,
        firstName: session?.user?.firstName || "",
        lastName: session?.user?.lastName || "",
        userImage: session?.user?.image || "",
        likes: newReply.likes || [],
        createdAt: newReply.createdAt || new Date(),
      };

      // Update the comments state to include the new reply
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), enhancedReply],
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
    } finally {
      // Clear loading state
      setReplyLoading(null);
    }
  };

  // Toggle like on a reply
  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!session?.user) {
      setError("You must be logged in to like replies");
      return;
    }

    if (!session?.user.isSubscribed) {
      setError("You must be subscribed to like replies");
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
                  const alreadyLiked =
                    userId &&
                    reply.likes?.some((like) =>
                      typeof like === "object" && like._id
                        ? like._id.toString() === userId
                        : like.toString() === userId
                    );

                  return {
                    ...reply,
                    likes: alreadyLiked
                      ? reply.likes?.filter((like) =>
                          typeof like === "object" && like._id
                            ? like._id.toString() !== userId
                            : like.toString() !== userId
                        )
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
        `/api/videos/${videoId}/comments/${commentId}/replies/${replyId}/likes`,
        {
          parentId: videoId,
          parentType: "video",
        }
      );
    } catch (err) {
      setError("Failed to like reply");
      console.error("Error liking reply:", err);
    }
  };

  // Fetch users who liked the video
  const fetchLikeUsers = async () => {
    setIsLoadingUsers(true);
    setShowLikesModal(true);
    try {
      const response = await axios.get(`/api/videos/${videoId}/likes/users`);
      setLikeUsers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching like users:", err);
      setError("Failed to load users who liked this video");
    } finally {
      setIsLoadingUsers(false);
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
      await axios.post(`/api/videos/${videoId}/likes/`, {
        parentId: videoId,
        parentType: "video",
      });
    } catch (err) {
      setError("Failed to like video");
      console.error("Error liking video:", err);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user) {
      setError("You must be logged in to delete comments");
      return;
    }

    try {
      await axios.delete(`/api/videos/${videoId}/comments/${commentId}/delete`);

      // Update the comments state
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      setError("Failed to delete comment");
      console.error("Error deleting comment:", err);
    }
  };

  // Delete a reply
  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!session?.user) {
      setError("You must be logged in to delete replies");
      return;
    }

    try {
      await axios.delete(
        `/api/videos/${videoId}/comments/${commentId}/replies/${replyId}/delete`
      );

      // Update the comments state
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies:
                comment.replies?.filter((reply) => reply._id !== replyId) || [],
            };
          }
          return comment;
        })
      );
    } catch (err) {
      setError("Failed to delete reply");
      console.error("Error deleting reply:", err);
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
        <h3 className="text-xl font-medium text-lovely">Comments</h3>
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeVideo}
            className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 ${
              session?.user &&
              session.user.id &&
              videoLikes.some((id) => id.toString() === session.user.id)
                ? "bg-lovely text-creamey"
                : "bg-creamey text-lovely border border-lovely"
            }`}
            disabled={!session?.user}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 transform ${
                session?.user &&
                session.user.id &&
                videoLikes.some((id) => id.toString() === session.user.id)
                  ? "fill-creamey animate-heartbeat"
                  : "hover:scale-125"
              }`}
            />
            {/* <span>Like</span> */}
          </button>
          {videoLikesCount === 0 && (
            <p className="hidden sm:block text-lovely">
              Be the first one to love this video.
            </p>
          )}
          {videoLikesCount > 0 && (
            <button
              onClick={fetchLikeUsers}
              className="text-lovely hover:underline"
            >
              {videoLikesCount}{" "}
              {videoLikesCount === 1
                ? "person love this video"
                : "people love this video"}
            </button>
          )}
        </div>
      </div>

      {/* Likes Modal */}
      <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}>
        <DialogContent className="bg-creamey text-lovely max-h-[80vh] overflow-y-scroll max-w-sm md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lovely">
              People who loved this video
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-lovely/20"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 rounded bg-lovely/20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : likeUsers.length > 0 ? (
              <ul className="space-y-4">
                {likeUsers.map((user) => (
                  <li key={user._id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.userImage || ""}
                        alt={user.username || ""}
                      />
                      {/* <AvatarFallback>
                        {getInitials(user.username || user.firstName || "User")}
                      </AvatarFallback> */}
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username || "User"}
                      </p>
                      {/* {user.username && user.firstName && (
                        <p className="text-sm text-lovely/70">
                          @{user.username}
                        </p>
                      )} */}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-4">No likes yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
              placeholder={
                session.user.isSubscribed
                  ? "Add a comment..."
                  : "Subscribe to comment..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-creamey text-lovely placeholder:text-lovely/50"
              disabled={!session.user.isSubscribed}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCommentSubmit}
                disabled={
                  loading || !newComment.trim() || !session.user.isSubscribed
                }
                className={`bg-lovely text-creamey hover:bg-lovely/90 ${
                  !session.user.isSubscribed
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={!session.user.isSubscribed ? "Subscribe to comment" : ""}
              >
                <Send className="mr-2 h-4 w-4" />
                {session.user.isSubscribed ? "Comment" : "Subscribe to Comment"}
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
                        } ${
                          !session?.user || !session?.user.isSubscribed
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={!session?.user || !session?.user.isSubscribed}
                        title={
                          !session?.user
                            ? "Login to like"
                            : !session?.user.isSubscribed
                            ? "Subscribe to like"
                            : ""
                        }
                      >
                        <ThumbsUp
                          className={`mr-1 h-4 w-4 ${
                            isLikedByUser ? "fill-lovely" : ""
                          }`}
                        />
                        {comment.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => {
                          if (!session?.user) {
                            setError(
                              "You must be logged in to reply to comments"
                            );
                            return;
                          }

                          if (!session?.user.isSubscribed) {
                            setError(
                              "You must be subscribed to reply to comments"
                            );
                            return;
                          }

                          setReplyingTo(
                            replyingTo === comment._id
                              ? null
                              : comment._id || ""
                          );
                        }}
                        className={`flex items-center text-sm text-lovely/60 hover:text-lovely ${
                          !session?.user || !session?.user.isSubscribed
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={!session?.user || !session?.user.isSubscribed}
                        title={
                          !session?.user
                            ? "Login to reply"
                            : !session?.user.isSubscribed
                            ? "Subscribe to reply"
                            : ""
                        }
                      >
                        <Reply className="mr-1 h-4 w-4" />
                        Reply
                      </button>
                      {session?.user?.id ===
                        (typeof comment.userId === "string"
                          ? comment.userId
                          : comment.userId?._id) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id || "")}
                          className="flex items-center text-center justify-center text-sm text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </button>
                      )}
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
                          className="border-lovely text-lovely hover:text-lovely hover:bg-lovely/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleReplySubmit(comment._id || "")}
                          disabled={
                            !replyText.trim() || replyLoading === comment._id
                          }
                          className="bg-lovely text-creamey hover:bg-lovely/90"
                        >
                          {replyLoading === comment._id ? (
                            <>
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-creamey border-t-transparent"></span>
                              Replying...
                            </>
                          ) : (
                            "Reply"
                          )}
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
                            reply.likes?.some((like) =>
                              typeof like === "object" && like._id
                                ? like._id.toString() === session.user.id
                                : like.toString() === session.user.id
                            );

                          return (
                            <div
                              key={reply._id || `reply-${comment._id}-${index}`}
                              className="flex gap-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    reply.userImage ||
                                    reply.userId?.imageURL ||
                                    ""
                                  }
                                  alt={
                                    reply.username ||
                                    reply.userId?.username ||
                                    ""
                                  }
                                />
                                <AvatarFallback>
                                  {getInitials(
                                    `${
                                      reply.firstName ||
                                      reply.userId?.firstName ||
                                      reply.username ||
                                      reply.userId?.username ||
                                      ""
                                    } ${
                                      reply.lastName ||
                                      reply.userId?.lastName ||
                                      ""
                                    }`
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm text-lovely">
                                    {`${
                                      reply.firstName ||
                                      reply.userId?.firstName ||
                                      reply.username ||
                                      reply.userId?.username ||
                                      ""
                                    } ${
                                      reply.lastName ||
                                      reply.userId?.lastName ||
                                      ""
                                    }`}
                                  </h5>
                                  <span className="text-xs text-lovely/60">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-lovely/80">
                                  {reply.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    onClick={() =>
                                      handleLikeReply(
                                        comment._id || "",
                                        reply._id || ""
                                      )
                                    }
                                    className={`flex items-center text-xs ${
                                      isReplyLikedByUser
                                        ? "text-lovely"
                                        : "text-lovely/60 hover:text-lovely"
                                    } ${
                                      !session?.user ||
                                      !session?.user.isSubscribed
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    disabled={
                                      !session?.user ||
                                      !session?.user.isSubscribed
                                    }
                                    title={
                                      !session?.user
                                        ? "Login to like"
                                        : !session?.user.isSubscribed
                                        ? "Subscribe to like"
                                        : ""
                                    }
                                  >
                                    <ThumbsUp
                                      className={`mr-1 h-3 w-3 ${
                                        isReplyLikedByUser ? "fill-lovely" : ""
                                      }`}
                                    />
                                    {reply.likes?.length || 0}
                                  </button>

                                  {session?.user?.id ===
                                    (typeof reply.userId === "string"
                                      ? reply.userId
                                      : reply.userId?._id) && (
                                    <button
                                      onClick={() =>
                                        handleDeleteReply(
                                          comment._id || "",
                                          reply._id || ""
                                        )
                                      }
                                      className="flex items-center text-xs text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      Delete
                                    </button>
                                  )}
                                </div>
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
