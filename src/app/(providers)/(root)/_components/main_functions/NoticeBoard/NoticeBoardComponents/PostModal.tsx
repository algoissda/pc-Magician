// PostModal.tsx
import React from "react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  theme: string;
  user: string;
  isMasterAccount: boolean;
}

const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  setTitle,
  content,
  setContent,
  type,
  setType,
  theme,
  user,
  isMasterAccount,
}) => {
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0D1117]" : "bg-white";
  const textThemeStyle = theme === "dark" ? "text-white" : "text-black";
  const borderThemeStyle =
    theme === "dark" ? "border-cyan-400" : "border-pink-500";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    if (!type) {
      e.preventDefault();
      alert("말머리를 선택해야 합니다.");
      return;
    }
    onSubmit(e);
  };

  return (
    <div
      className={`absolute top-0 left-0 w-full min-h-full px-11 pt-11 rounded-lg ${backgroundThemeStyle}`}
    >
      <button
        type="button"
        onClick={onClose}
        className={`absolute top-4 left-4 px-4 py-2 rounded-lg ${backgroundThemeStyle} ${textThemeStyle}`}
      >
        ← 돌아가기
      </button>
      <h2 className={`text-lg font-bold mb-4 mt-7 ${textThemeStyle}`}>
        새 글 작성
      </h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className={`w-full mb-4 p-2 rounded-md ${backgroundThemeStyle} ${textThemeStyle} border ${borderThemeStyle}`}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`w-full mb-4 p-2 rounded-md ${backgroundThemeStyle} ${textThemeStyle} border ${borderThemeStyle} ${
            type === "공지"
              ? "text-red-500"
              : type === ""
              ? "text-gray-500"
              : ""
          }`}
        >
          <option className="text-gray-500" value="">
            말머리
          </option>
          {(isMasterAccount ||
            user === "6054893d-06b4-49ac-923f-c8146f701678") && (
            <option className="text-red-500" value="공지">
              공지
            </option>
          )}
          <option value="잡담">잡담</option>
          <option value="정보">정보</option>
          <option value="질문">질문</option>
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`이상한 글 쓰면 고소합니다.\n글 쓰고 바로 지워도 DB에 로그 남습니다.`}
          className={`w-full mb-4 p-2 rounded-md h-[40vh] ${backgroundThemeStyle} ${textThemeStyle} border ${borderThemeStyle}`}
        />
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg ${backgroundThemeStyle} ${textThemeStyle}`}
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostModal;
