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
  const [userLikes, setUserLikes] = useState<number[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from("post").select("*");
      if (error) {
        console.error(error);
        return;
      } else {
        const updatedPosts = [];
        for (const post of data) {
          const { data: likesData } = await supabase
            .from("post_like")
            .select("*")
            .eq("post_id", post.id);

          const likeCount = likesData ? likesData.length : 0;
          updatedPosts.push({ ...post, like: likeCount });
        }
        setPosts(updatedPosts);
      }
    };

    const fetchUserLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userLikesData } = await supabase
          .from("post_like")
          .select("post_id")
          .eq("uid", user.id);

        const userLikesArray = userLikesData ? userLikesData.map(like => like.post_id) : [];
        setUserLikes(userLikesArray); // 배열로 상태 업데이트
      }
    };

    fetchPosts();
    fetchUserLikes();
  }, []);

  const handlePostClick = (post: PostType) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  const handleClickLikePost = async (postId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not logged in");
      return;
    }
  
    const isLiked = userLikes.includes(postId); // 배열에서 좋아요 여부 확인
  
    // 현재 포스트의 좋아요 수 업데이트
    const updatedPost = posts.map(post => {
      if (post.id === postId) {
        return { ...post, like: isLiked ? post.like - 1 : post.like + 1 };
      }
      return post;
    });
  
    setPosts(updatedPost);
  
    if (isLiked) {
      // 좋아요 취소
      await supabase.from("post_like").delete().eq("post_id", postId).eq("uid", user.id);
      setUserLikes(userLikes.filter(id => id !== postId)); // 배열에서 삭제
    } else {
      // 좋아요 추가
      await supabase.from("post_like").insert({ post_id: postId, uid: user.id });
      setUserLikes([...userLikes, postId]); // 배열에 추가
    }
  };

  return (
    <main>
      <section className="flex flex-col items-center justify-center h-full w-full">
        <h2 className={`text-4xl ml-[19rem] mt-[15px] font-serif ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
          Notice Board
        </h2>
        <section className="mt-[60px] ml-[23rem] absolute transition-all duration-700 top-0">
          <article className="flex-grow">
            <section className="bg-black bg-opacity-20 h-[700px] w-[990px] mr-20 border border-pink-500 pl-3 pt-4 pr-4 overflow-y-scroll">
              <div className="border-pink-500 border">
                <div className={`flex justify-between p-2 border-b font-bold ${theme === "dark" ? "border-white text-white" : "border-[#0d1117] text-[#0d1117]"}`}>
                  <span className={`border-r pr-3 ${theme === "dark" ? "border-white" : "border-[#0d1117]"}`}>No.</span>
                  <span className="w-1/2 pl-[223px] absolute">Title</span>
                  <span className="ml-[210px]">작성 날짜</span>
                  <span>Action</span>
                </div>
                {posts.map((post, index) => {
                  return (
                    <div key={post.id} onClick={() => handlePostClick(post)} className={`flex p-2 border-b ${theme === "dark" ? "border-white text-white" : "border-[#0d1117] text-[#0d1117] opacity-70"}`}>
                      <span className="pl-3">{index + 1}</span>
                      <span className="text-center">{post.title}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded ${theme === "dark" ? "border-white text-white" : "border-[#0d1117] text-[#0d1117] opacity-70"}`}>
                        {post.like}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </article>
        </section>
        {selectedPost && (
          <div className="absolute w-[995px] h-[700px] bg-white border-pink-500 border p-[10%] overflow-y-scroll ml-[33.5%] mt-[89.5%]">
            <div className="p-4 border border-pink-500">
              <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
              <p className="mt-2 text-gray-600">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
              <p className="mt-4">{selectedPost.content}</p>
              <button
                onClick={() => handleClickLikePost(selectedPost.id)}
                className="mt-4 px-4 py-2 bg-gray-300 rounded"
              >
                {userLikes.includes(selectedPost.id) ? "Unlike" : "Like"}
              </button>
              <button onClick={handleCloseDetail} className="mt-4 px-4 py-2 bg-gray-300 rounded">Close</button>
            </div>
          </div>
        )}
      </section>
      <div className="flex mt-[720px] justify-between items-center w-[80%] ml-[292px] pl-48">
        <div className="flex items-center space-x-4">
          <button className="ml-6 px-4 py-2 bg-gray-200 rounded-lg">{"<"}</button>
          <p className="pl-6">1</p>
          <span className="w-3 flex justify-center items-center"></span>
          <button className="px-4 py-2 bg-gray-200 rounded-lg">{">"}</button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-white font-bold text-black rounded-lg px-5 py-3 w-auto ml-20">글쓰기</button>
      </div>
      <WritePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}

export default NoticeBoard;
