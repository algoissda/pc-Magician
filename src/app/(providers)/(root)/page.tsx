/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Build from "./_components/Build a PC/Build";
import CommunityBuilds from "./_components/community_builds/page";
import ViewBuildsByPrice from "./_components/view_builds_by_price/page";

function MainPage() {
  const [activeTab, setActiveTab] = useState<string>("");

  const renderFormContent = () => {
    if (activeTab === "") {
      return (
        <div className="relative h-full w-full">
          <img
            className="absolute top-[10%] right-[0] w-[80%] object-cover"
            src="https://cdn.discordapp.com/attachments/1108383158266761337/1296724705616723998/dsadasdasda.png?ex=6713547d&is=671202fd&hm=e0f22573d5a2549914414534b1aedf48885b4ed740d464b3af02555d7e74cdfc&"
            alt="Custom PC"
          />
        </div>
      );
    } else if (activeTab === "Build a PC") {
      return (
        // 컴포넌트화
        <Build />
      );
    } else if (activeTab === "View Builds by Price") {
      return (
        // 컴포넌트화
        <ViewBuildsByPrice />
      );
    } else if (activeTab === "Community Builds") {
      return (
        // 컴포넌트화
        <CommunityBuilds />
      );
    }
    return null;
  };

  return (
    <div className="flex bg-black overflow-hidden h-screen">
      <div className="w-1/4 p-5 ml-28 mt-[3rem]">
        <div className="flex flex-col items-start justify-center ml-10">
          <button>
            <p
              onClick={() => setActiveTab("")}
              className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-300 to-violet-700 bg-[60deg] font-serif text-[70px] mb-10 text-left"
            >
              Custom PC <br />
              Magician
            </p>
          </button>
          <div className="font-serif w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
            <button
              onClick={() => setActiveTab("Build a PC")}
              className={
                activeTab !== "Build a PC"
                  ? "w-full p-2 text-3xl h-[50px] bg-[#0f1113] text-white rounded-full"
                  : "w-full p-2 text-3xl h-[50px] bg-[#ffffff] text-black rounded-full"
              }
            >
              Build a PC
            </button>
          </div>
          <div className="font-serif w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
            <button
              onClick={() => setActiveTab("View Builds by Price")}
              className={
                activeTab !== "View Builds by Price"
                  ? "w-full p-2 bg-[#0f1113] text-white rounded-full text-xl h-[50px]"
                  : "w-full p-2 bg-[#ffffff] text-black rounded-full text-xl h-[50px]"
              }
            >
              View Builds by Price
            </button>
          </div>
          <div className="font-serif w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
            <button
              onClick={() => setActiveTab("Community Builds")}
              className={
                activeTab !== "Community Builds"
                  ? "w-full p-2 bg-[#0f1113] text-white rounded-full text-2xl h-[50px]"
                  : "w-full p-2 bg-[#ffffff] text-black rounded-full text-2xl h-[50px]"
              }
            >
              Community Builds
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow p-5 h-full">{renderFormContent()}</div>
    </div>
  );
}

export default MainPage;
