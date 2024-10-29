import { useState } from "react";
import { supabase } from "../../../../../../../../supabase/client";

interface WritePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WritePostModal = ({ isOpen, onClose }: WritePostModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      type,
      title,
      content,
      like: 0,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("post").insert([postData]);
    if (error) {
      console.error("Error inserting post:", error);
    } else {
      console.log("Post inserted:", data);
      onClose(); // 모달 닫기
    }
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-pink-500 border  p-[100px] rounded shadow-lg w-[990px] h-[710px] mt-[70px] ml-[513px]"
      >
        <div className="border border-pink-500 p-4">
          <h3 className="text-xl font-bold mb-4">Write a New Post</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
              className="border rounded w-full p-2 mb-4"
              required
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border rounded w-full p-2 mb-4"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              className="border rounded w-full p-2 mb-4 h-[300px]"
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 py-1 px-3 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1 px-3 bg-blue-500 text-white rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WritePostModal;
