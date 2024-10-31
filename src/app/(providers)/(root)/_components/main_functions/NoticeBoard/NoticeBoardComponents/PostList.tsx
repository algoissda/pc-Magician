// PostList.tsx
import React from "react";

interface PostType {
  id: number;
  type: string;
  title: string;
  like: number;
  created_at: string;
  uid: string;
}

interface PostListProps {
  posts: PostType[];
  onPostClick: (post: PostType) => void;
  backgroundThemeStyle: string;
  theme: string;
  page: number;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (isToday) {
    return `${hours}:${minutes}`;
  } else {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
  }
};

const PostList: React.FC<PostListProps> = ({
  posts,
  onPostClick,
  theme,
  page,
}) => {
  const textThemeStyle = theme === "dark" ? "text-white" : "text-black";
  const hoverThemeStyle =
    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-300";
  return (
    <>
      <div
        className={`grid grid-cols-12 text-center font-bold p-2 ${textThemeStyle}`}
      >
        <span className="col-span-1">No.</span>
        <span className="col-span-2">말머리</span>
        <span className="col-span-4">제목</span>
        <span className="col-span-2">작성자</span>
        <span className="col-span-2">작성일</span>
        <span className="col-span-1">개추</span>
      </div>

      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`${hoverThemeStyle} grid grid-cols-12 p-3 cursor-pointer`}
          onClick={() => onPostClick(post)}
        >
          <div className="col-span-1 text-center">
            <span className={textThemeStyle}>
              {index + 1 + (page - 1) * 10}
            </span>
          </div>
          <div
            className={`col-span-2 text-center ${
              post.type === "공지" ? "text-red-500" : textThemeStyle
            }`}
          >
            <span>{post.type === "공지" ? `[ ${post.type} ]` : post.type}</span>
          </div>

          <div className="col-span-4 text-center">
            <span className={textThemeStyle}>{post.title}</span>
          </div>
          <div className="col-span-2 text-center">
            <span className={textThemeStyle}>{post.uid}</span>
          </div>
          <div className="col-span-2 text-center">
            <span className={textThemeStyle}>
              {formatDate(post.created_at)}
            </span>
          </div>
          <div className="col-span-1 text-center">
            <span className={textThemeStyle}>{post.like}</span>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostList;
