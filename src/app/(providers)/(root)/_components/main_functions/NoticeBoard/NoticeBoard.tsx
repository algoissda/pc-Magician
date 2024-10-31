// NoticeBoard.tsx
import { useThemeStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import PostDetail from "./NoticeBoardComponents/PostDetail";
import PostList from "./NoticeBoardComponents/PostList";
import PostModal from "./NoticeBoardComponents/PostModal";
import { loadingRandomImgArray } from "./NoticeBoardComponents/loadingRandomImgArray";

interface PostType {
  id: number;
  type: string;
  title: string;
  like: number;
  created_at: string;
  uid: string;
}

interface CommentType {
  id: number;
  uid: string;
  post_id: number;
  content: string;
  created_at: string;
}

function NoticeBoard() {
  const theme = useThemeStore((state) => state.theme);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [postContent, setPostContent] = useState<string>("");
  const [userLikes, setUserLikes] = useState<number[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  interface UserType {
    id: string;
    [key: string]: string | number | boolean; // Add other user properties as needed
  }

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isMasterAccount, setIsMasterAccount] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingImgIndex, setLoadingImgIndex] = useState<number>(
    Math.floor(Math.random() * loadingRandomImgArray.length)
  );
  const postsPerPage = 10;

  const fetchPosts = async () => {
    setLoading(true);
    const from = (page - 1) * postsPerPage;
    const to = from + postsPerPage - 1;

    const { data, error } = await supabase
      .from("post")
      .select("id, type, title, uid, created_at")
      .eq("delete", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("게시물 가져오기 중 오류 발생: ", error);
      setLoading(false);
      return;
    }

    const now = new Date();
    const tenDaysAgo = new Date(now.setDate(now.getDate() - 10));

    const notices: PostType[] = [];
    const otherPosts: PostType[] = [];

    for (const post of data) {
      const { data: likesData } = await supabase
        .from("post_like")
        .select("*")
        .eq("post_id", post.id);

      const { data: commentData } = await supabase
        .from("comment")
        .select("id")
        .eq("post_id", post.id)
        .eq("delete", false);

      const likeCount = likesData ? likesData.length : 0;
      const commentCount = commentData ? commentData.length : 0;
      const updatedTitle =
        commentCount > 0 ? `${post.title}[${commentCount}]` : post.title;

      const postWithUpdatedInfo = {
        ...post,
        like: likeCount,
        title: updatedTitle,
      };

      if (post.type === "공지" && new Date(post.created_at) >= tenDaysAgo) {
        notices.push(postWithUpdatedInfo);
      } else {
        otherPosts.push(postWithUpdatedInfo);
      }
    }

    setPosts([...notices, ...otherPosts]);
    setHasNextPage(data.length === postsPerPage);
    setLoading(false);
    setLoadingImgIndex(
      Math.floor(Math.random() * loadingRandomImgArray.length)
    );
  };

  const fetchUserLikes = async (user: { id: string }) => {
    if (user) {
      const { data: userLikesData } = await supabase
        .from("post_like")
        .select("post_id")
        .eq("uid", user.id);

      const userLikesArray = userLikesData
        ? userLikesData.map((like) => like.post_id)
        : [];
      setUserLikes(userLikesArray);
    }
  };

  const checkMasterAccount = async (user: { id: string }) => {
    if (user) {
      const { data, error } = await supabase
        .from("master_account")
        .select("uid")
        .eq("uid", user.id)
        .single();

      console.log(`id : ${user.id} / ${error}`);
      console.log(data);

      if (error) {
        console.error("Error checking master account: ", error);
        return;
      }

      if (data.uid === user.id) {
        setIsMasterAccount(true);
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user: ", error);
        return;
      }
      const user = data.user;
      const mappedUser: UserType = {
        id: user.id,
        ...user.user_metadata, // Assuming user_metadata contains other properties
      };
      setCurrentUser(mappedUser);
      fetchUserLikes(mappedUser);
      checkMasterAccount(mappedUser);
    };

    fetchPosts();
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchComments = async (postId: number) => {
    const { data, error } = await supabase
      .from("comment")
      .select("*")
      .eq("post_id", postId)
      .eq("delete", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments: ", error);
    } else {
      setComments(data || []);
    }
  };

  const fetchPostContent = async (postId: number) => {
    const { data, error } = await supabase
      .from("post")
      .select("content")
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching post content: ", error);
    } else {
      setPostContent(data?.content || "");
    }
  };

  const handlePostClick = async (post: PostType) => {
    setSelectedPost(post);
    await fetchPostContent(post.id);
    fetchComments(post.id);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setComments([]);
    setPostContent("");
  };

  const handleClickLikePost = async (postId: number) => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const isLiked = userLikes.includes(postId);
    let updatedLikeCount = selectedPost ? selectedPost.like : 0;

    if (isLiked) {
      await supabase
        .from("post_like")
        .delete()
        .eq("post_id", postId)
        .eq("uid", currentUser.id);
      setUserLikes(userLikes.filter((id) => id !== postId));
      updatedLikeCount -= 1;
    } else {
      await supabase
        .from("post_like")
        .insert({ post_id: postId, uid: currentUser.id });
      setUserLikes([...userLikes, postId]);
      updatedLikeCount += 1;
    }

    if (selectedPost) {
      setSelectedPost({ ...selectedPost, like: updatedLikeCount });
    }

    await fetchPosts();
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const post = posts.find((post) => post.id === postId);
    if (post?.uid !== currentUser.id && !isMasterAccount) {
      console.error("User is not authorized to delete this post");
      return;
    }

    const { error: updateError } = await supabase
      .from("post")
      .update({ delete: true })
      .eq("id", postId);

    if (updateError) {
      console.error("Error updating delete status: ", updateError);
    } else {
      await fetchPosts();
      handleCloseDetail();
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const comment = comments.find((comment) => comment.id === commentId);
    if (comment?.uid !== currentUser.id && !isMasterAccount) {
      console.error("User is not authorized to delete this comment");
      return;
    }

    const { error: updateError } = await supabase
      .from("comment")
      .update({ delete: true })
      .eq("id", commentId);

    if (updateError) {
      console.error("Error updating delete status: ", updateError);
    } else {
      if (selectedPost) {
        await fetchComments(selectedPost.id);
      }
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    if (!newComment.trim()) {
      console.error("Comment content is empty");
      return;
    }

    if (!selectedPost?.id) {
      console.error("Post ID is undefined");
      return;
    }

    const commentData = {
      uid: currentUser.id,
      post_id: selectedPost.id,
      content: newComment,
      created_at: new Date().toISOString(),
    };
    try {
      const { error: insertError } = await supabase
        .from("comment")
        .insert([commentData]);
      if (insertError) {
        console.error("Error adding comment: ", insertError);
      } else {
        setNewComment("");
        if (selectedPost) {
          await fetchComments(selectedPost.id);
        }
      }
    } catch (error) {
      console.error("Error in handleAddComment: ", error);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      alert("말머리를 선택해야 합니다.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해야 합니다.");
      return;
    }

    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const postData = {
      type,
      title,
      content,
      like: 0,
      created_at: new Date().toISOString(),
      uid: currentUser.id,
    };

    const { data, error } = await supabase.from("post").insert([postData]);
    if (error) {
      console.error("Error inserting post:", error);
    } else {
      console.log("Post inserted:", data);
      setIsModalOpen(false);
      fetchPosts(); // Re-fetch posts after a new one is added.
    }
  };

  const backgroundThemeStyle = theme === "dark" ? "bg-[#0D1117]" : "bg-white";
  const textThemeStyle = theme === "dark" ? "text-white" : "text-black";
  const borderColorThemeStyle =
    theme === "dark" ? "border-gray-300" : "border-[#0D1117]";
  const divideColorThemeStyle =
    theme === "dark" ? "divide-cyan-400" : "divide-pink-500";
  const blockedPanelBuildedStyle = loading
    ? "opacity-100 pointer-events-auto "
    : "opacity-0 pointer-events-none ";

  return (
    <div className="relative h-full overflow-hidden top-[55px] left-[7%] ">
      <div
        className={`${blockedPanelBuildedStyle} ${backgroundThemeStyle} absolute flex justify-center items-center w-[60vw] h-[73vh] inset-0 bg-opacity-50 z-40 text-6xl`}
      >
        <span className="">{loadingRandomImgArray[loadingImgIndex]}</span>
      </div>
      <div
        className={`${backgroundThemeStyle} ${borderColorThemeStyle} ${divideColorThemeStyle} border-t border-b overflow-y-scroll relative divide-y w-[60vw] h-[73vh] mb-5 p-5 bg-opacity-60`}
      >
        <PostList
          posts={posts}
          onPostClick={handlePostClick}
          backgroundThemeStyle={backgroundThemeStyle}
          theme={theme}
          page={page}
        />
      </div>
      <div
        className={`${
          isModalOpen ? "pointer-events-auto" : "pointer-events-none"
        } absolute top-0 left-0 border-t border-b overflow-y-scroll divide-y w-[60vw] h-[73vh] mb-5 p-5 bg-opacity-60`}
      >
        {isModalOpen && (
          <PostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitPost}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            type={type}
            setType={setType}
            theme={theme}
            user={currentUser?.id || ""}
            isMasterAccount={isMasterAccount}
          />
        )}
      </div>
      <div
        className={`${
          selectedPost ? "pointer-events-auto" : "pointer-events-none"
        } absolute top-0 left-0 border-t border-b overflow-y-scroll divide-y w-[60vw] h-[73vh] mb-5 p-5 bg-opacity-60`}
      >
        {selectedPost && (
          <PostDetail
            post={selectedPost}
            content={postContent}
            comments={comments}
            onClose={handleCloseDetail}
            onClickLike={handleClickLikePost}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
            onAddComment={handleAddComment}
            newComment={newComment}
            setNewComment={setNewComment}
            currentUser={currentUser}
            isMasterAccount={isMasterAccount}
            theme={theme}
          />
        )}
      </div>
      <nav className="mt-4 w-[60vw]">
        <div className="relative w-full flex justify-center gap-3 ">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 ${backgroundThemeStyle} ${textThemeStyle} rounded-lg`}
            disabled={page === 1}
          >
            {"<"}
          </button>
          <span
            className={`${textThemeStyle} w-3 flex justify-center items-center`}
          >
            {page}
          </span>
          <button
            onClick={() => setPage((prev) => (hasNextPage ? prev + 1 : prev))}
            className={`px-4 py-2 ${backgroundThemeStyle} ${textThemeStyle} rounded-lg`}
            disabled={!hasNextPage}
          >
            {">"}
          </button>
          <div className="absolute right-0 flex justify-between mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${backgroundThemeStyle} ${textThemeStyle}`}
              onClick={() => {
                if (currentUser) {
                  setIsModalOpen(true);
                  handleCloseDetail();
                } else {
                  console.error("User not logged in");
                }
              }}
              disabled={!currentUser}
            >
              글쓰기
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NoticeBoard;
