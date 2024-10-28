"use client";

import { useThemeStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import WritePostModal from "./NoticeBoardComponents/WritePostModal";

interface PostType {
  id: number;
  type: string;
  title: string;
  content: string;
  like: number;
  created_at: string;
}
function NoticeBoard() {
  const theme = useThemeStore((state) => state.theme);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("post").select("*");
      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (post: PostType) => {
    setSelectedPost(post);
  };
  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  return (
    <main>
      <section className="flex flex-col items-center justify-center h-full w-full">
        <h2
          className={`text-6xl  ml-[21rem] mt-16 font-serif ${
            theme === "dark" ? "  text-gray-300" : "  text-gray-800 "
          }`}
        >
          Notice Board
        </h2>
        <section className="w-full mt-10 ml-[25rem]">
          <article className="flex-grow">
            <section className="bg-black bg-opacity-20 min-h-[500px] mr-20">
              <div
                className={`flex justify-between p-2 border-b font-bold  ${
                  theme === "dark"
                    ? "  border-white text-white"
                    : "  border-[#0d1117] text-[#0d1117] "
                } `}
              >
                <span
                  className={`border-r pr-3 ${
                    theme === "dark" ? "  border-white" : "  border-[#0d1117] "
                  } `}
                >
                  No.
                </span>
                <span className="w-1/2 pl-[223px] absolute ">Title</span>
                <span className="ml-[210px]">작성 날짜</span>
                <span>Action</span>
              </div>
              {posts.map((post, index) => {
                return (
                  <div
                    key={post.id}
                    onClick={(e) => handlePostClick(post)}
                    className={`flex justify-between p-2 border-b  ${
                      theme === "dark"
                        ? "  border-white text-white"
                        : "  border-[#0d1117] text-[#0d1117] opacity-70 "
                    }  `}
                  >
                    <span>{index + 1}</span>
                    <span className="">{post.title}</span>
                    <span className="">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={` px-3 py-1 rounded ${
                        theme === "dark"
                          ? "  border-white text-white"
                          : "  border-[#0d1117] text-[#0d1117] opacity-70 "
                      } `}
                    >
                      {post.like}
                    </span>
                  </div>
                );
              })}
            </section>
          </article>
        </section>
        {selectedPost && (
          <div className="absolute w-[784px] h-[650px] bg-white p-5 overflow-y-scroll ml-[37%] mt-[36%]">
            <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
            <p className="mt-2 text-gray-600">
              {new Date(selectedPost.created_at).toLocaleDateString()}
            </p>
            <p className="mt-4">{selectedPost.content}</p>
            <button
              onClick={handleCloseDetail}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>
          </div>
        )}
      </section>
      <div className="flex mt-20 justify-between items-center w-[80%] ml-[292px] pl-48">
        <div className="flex items-center space-x-4">
          <button className="ml-6 px-4 py-2 bg-gray-200 rounded-lg">
            {"<"}
          </button>
          <p className="pl-6">1</p>
          <span className="w-3 flex justify-center items-center"></span>
          <button className="px-4 py-2 bg-gray-200 rounded-lg">{">"}</button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white font-bold text-black rounded-lg px-5 py-3 w-auto ml-20"
        >
          글쓰기
        </button>
      </div>
      <WritePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default NoticeBoard;
