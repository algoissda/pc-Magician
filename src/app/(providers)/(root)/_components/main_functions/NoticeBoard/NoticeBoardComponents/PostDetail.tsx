// PostDetail.tsx
import React, { useEffect } from "react";

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

interface PostDetailProps {
  post: PostType;
  content: string;
  comments: CommentType[];
  onClose: () => void;
  onClickLike: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  onDeleteComment: (commentId: number) => void;
  onAddComment: () => void;
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  currentUser: any;
  isMasterAccount: boolean;
  theme: string;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  content,
  comments,
  onClose,
  onClickLike,
  onDeletePost,
  onDeleteComment,
  onAddComment,
  newComment,
  setNewComment,
  currentUser,
  isMasterAccount,
  theme,
}) => {
  useEffect(() => {
    console.log("Is Master Account: ", isMasterAccount);
  }, [isMasterAccount]);

  const backgroundThemeStyle = theme === "dark" ? "bg-[#0D1117]" : "bg-white";
  const borderThemeStyle =
    theme === "dark" ? "border-cyan-400" : "border-pink-500";
  const textThemeStyle = theme === "dark" ? "text-white" : "text-black";
  const grayTextThemeStyle =
    theme === "dark" ? "text-gray-400" : "text-gray-700";

  return (
    <div
      className={`absolute top-0 left-0 w-full min-h-full p-11 rounded-lg  ${backgroundThemeStyle}`}
    >
      <button
        onClick={onClose}
        className={`absolute top-4 left-4 px-4 py-2 rounded-lg ${backgroundThemeStyle} ${textThemeStyle}`}
      >
        ← 돌아가기
      </button>
      <h2 className={`text-3xl font-bold mb-1 mt-6 ${textThemeStyle}`}>
        {post.title}
      </h2>
      <p className={`text-xs mb-2 ${grayTextThemeStyle}`}>글쓴이 {post.uid}</p>
      <div className="w-full h-[30vh] overflow-y-auto">
        <p className={`mb-6 ${textThemeStyle}`}>{content}</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => onClickLike(post.id)}
          className={`px-3 py-1 rounded-md mt-4 border ${borderThemeStyle} ${backgroundThemeStyle} ${textThemeStyle}`}
        >
          {post.like} 개추
        </button>
      </div>

      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${textThemeStyle}`}>
          Comments
        </h3>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`flex justify-between items-center p-2 mb-1 ${backgroundThemeStyle} bg-opacity-70 rounded-md`}
          >
            <span className={`${textThemeStyle}`}>{comment.content}</span>
            <span className={`${grayTextThemeStyle} text-sm ml-4`}>
              {comment.uid}
            </span>
            {(currentUser && comment.uid === currentUser.id) ||
            isMasterAccount ? (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-red-500 hover:underline ml-4"
              >
                삭제
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="w-full flex gap-4 bg-black bg-opacity-10 p-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className={`w-full px-4 py-2 rounded-md border .shadow-center-md ${backgroundThemeStyle} ${textThemeStyle} ${borderThemeStyle}`}
          placeholder="타인의 권리를 침해하거나 명예를 훼손하는 댓글은 고소합니다."
          disabled={!currentUser}
        />
        <button
          onClick={onAddComment}
          className={`px-4 py-2 rounded-md text-nowrap ${backgroundThemeStyle} ${textThemeStyle}`}
          disabled={!currentUser}
        >
          등록
        </button>
      </div>
      <div className="flex justify-between mt-6">
        {(currentUser && post.uid === currentUser.id) || isMasterAccount ? (
          <button
            onClick={() => onDeletePost(post.id)}
            className="px-4 py-2 bg-red-600 rounded-lg text-white"
          >
            글 삭제
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PostDetail;
