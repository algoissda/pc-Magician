/* eslint-disable @next/next/no-img-element */
"use client";

import { useThemeStore } from "@/store/useStore";
import { useState } from "react";
import Build from "./_components/Build a PC/Build";
import CommunityBuilds from "./_components/community_builds/page";
import ViewBuildsByPrice from "./_components/view_builds_by_price/page";

function MainPage() {
  const theme = useThemeStore((state) => state.theme);
  const [activeTab, setActiveTab] = useState<string>("");

  const renderFormContent = () => {
    if (activeTab === "") {
      return (
        <div className="relative h-[110%] w-[110%] right-[-50px] top-[-80px]">
          <img
            className="absolute top-[13%] left-[180px] right-[] w-[80%] object-cover"
            src="https://i.ibb.co/vx1KXC8/image-720.png"
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
    <>
      {theme.toLowerCase() === "dark" ? (
        <div className="relative flex bg-[#0d1117] overflow-hidden h-screen">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-pink-500/0 to-black z-0 pointer-events-none theme-opacity opacity-100`}
          ></div>
          <div
            className={`absolute inset-0 bg-gradient-to-r from-gray-400/0 to-gray-400 z-0 pointer-events-none theme-opacity opacity-0`}
          ></div>
          {/* <img
            src="https://i.namu.wiki/i/kDxN8Y1I3QnwN_7WmesRlM5L-p54NzRD1fCxyKAm5JB0NsE2Kg562c5gfGH6vKIB0LQIVrMaehxTxwlDVa91cA.webp"
            alt=""
            className={`absolute inset-0 h-full transform transition-all duration-300 ease-in-out ${
              theme !== "dark"
                ? "left-[-15%] opacity-100"
                : "left-[-100%] opacity-0"
            } pointer-events-none blur-mask`}
          />
          <img
            src="https://tumblbug-pci.imgix.net/6eec8030c730675bec7c1ff93f61a08162934ebd/7bb35479921a8dfd09d353f5b8716b88ca913235/57e7c6e9fe723a1167b0ce458db447bcc07935ed/30603416-80c1-43cc-bd36-4f8f239b1508.png?auto=format%2Ccompress&fit=max&h=930&lossless=true&w=1240&s=25719117e6379d625fde0fa3c61af94a"
            alt=""
            className={`absolute inset-0 h-full transform transition-all duration-300 ease-in-out ${
              theme === "dark"
                ? "left-[-20%] opacity-70 scale-x-[-1]"
                : "left-[-100%] opacity-0 scale-x-[-1]"
            } pointer-events-none blur-mask`}
          /> */}
          <nav className="w-full lg:w-1/4 p-5 ml-10 lg:ml-28 mt-10 lg:mt-[3rem] z-10">
            <header className="flex flex-col items-start justify-center ml-4 lg:ml-10">
              <button>
                <div className="relative inline-block w-96">
                  {/* 보이지 않지만 크기를 차지하는 요소 */}
                  <h1 className="invisible text-[70px] font-serif mb-10">
                    Custom PC <br />
                    Magician
                  </h1>
                  <h1
                    onClick={() => setActiveTab("")}
                    className={`theme-opacity absolute top-0 left-0 inset-0 text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-white via-blue-300 to-violet-500 bg-[60deg] font-serif text-[70px] mb-10 text-left transition-all duration-500 ease-in-out opacity-100`}
                  >
                    Custom PC <br />
                    Magician
                  </h1>
                  <h1
                    onClick={() => setActiveTab("")}
                    className={`theme-opacity absolute top-0 left-0 inset-0 text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-violet-700 via-blue-950 to-black bg-[60deg] font-serif text-[70px] mb-10 text-left transition-all duration-500 ease-in-out opacity-0`}
                  >
                    Custom PC <br />
                    Magician
                  </h1>
                </div>
              </button>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("Build a PC")}
                  className={
                    activeTab !== "Build a PC"
                      ? "w-full p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl h-[50px] bg-[#0f1113] rounded-full"
                      : "w-full p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl h-[50px] bg-[#ffffff] rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "Build a PC"
                        ? " text-white"
                        : " text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-violet-800 bg-[60deg]"
                    }
                  >
                    Build a PC
                  </p>
                </button>
              </section>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("View Builds by Price")}
                  className={
                    activeTab !== "View Builds by Price"
                      ? "w-full p-2 text-base sm:text-lg md:text-xl h-[50px] bg-[#0f1113] rounded-full"
                      : "w-full p-2 text-base sm:text-lg md:text-xl h-[50px] bg-[#ffffff] rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "View Builds by Price"
                        ? " text-white"
                        : " text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-violet-800 bg-[60deg]"
                    }
                  >
                    View Builds by Price
                  </p>
                </button>
              </section>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("Community Builds")}
                  className={
                    activeTab !== "Community Builds"
                      ? "w-full p-2 text-lg sm:text-xl md:text-2xl h-[50px] bg-[#0f1113] rounded-full"
                      : "w-full p-2 text-lg sm:text-xl md:text-2xl h-[50px] bg-[#ffffff] rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "Community Builds"
                        ? " text-white"
                        : " text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-violet-800 bg-[60deg]"
                    }
                  >
                    Community Builds
                  </p>
                </button>
              </section>
            </header>
          </nav>
          <main className="flex-grow p-5 h-full z-10">
            {renderFormContent()}
          </main>
        </div>
      ) : (
        <div className="relative flex bg-white overflow-hidden h-screen">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-pink-500/0 to-black z-0 pointer-events-none theme-opacity opacity-0`}
          ></div>
          <div
            className={`absolute inset-0 bg-gradient-to-r from-gray-400/0 to-gray-400 z-0 pointer-events-none theme-opacity opacity-100`}
          ></div>
          {/* <img
            src="https://i.namu.wiki/i/kDxN8Y1I3QnwN_7WmesRlM5L-p54NzRD1fCxyKAm5JB0NsE2Kg562c5gfGH6vKIB0LQIVrMaehxTxwlDVa91cA.webp"
            alt=""
            className={`absolute inset-0 h-full transform transition-all duration-300 ease-in-out ${
              theme !== "dark"
                ? "left-[-15%] opacity-100"
                : "left-[-100%] opacity-0"
            } pointer-events-none blur-mask`}
          />

          <img
            src="https://tumblbug-pci.imgix.net/6eec8030c730675bec7c1ff93f61a08162934ebd/7bb35479921a8dfd09d353f5b8716b88ca913235/57e7c6e9fe723a1167b0ce458db447bcc07935ed/30603416-80c1-43cc-bd36-4f8f239b1508.png?auto=format%2Ccompress&fit=max&h=930&lossless=true&w=1240&s=25719117e6379d625fde0fa3c61af94a"
            alt=""
            className={`absolute inset-0 h-full transform transition-all duration-300 ease-in-out ${
              theme === "dark"
                ? "left-[-20%] opacity-70 scale-x-[-1]"
                : "left-[-100%] opacity-0 scale-x-[-1]"
            } pointer-events-none blur-mask`}
          /> */}

          <nav className="w-full lg:w-1/4 p-5 ml-10 lg:ml-28 mt-10 lg:mt-[3rem] z-10">
            <header className="flex flex-col items-start justify-center ml-4 lg:ml-10">
              <button>
                <div className="relative inline-block w-96">
                  <h1 className="invisible text-[70px] font-serif mb-10">
                    Custom PC <br />
                    Magician
                  </h1>
                  <h1
                    onClick={() => setActiveTab("")}
                    className={`theme-opacity absolute top-0 left-0 inset-0 text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-white via-blue-300 to-violet-500 bg-[60deg] font-serif text-[70px] mb-10 text-left transition-all duration-500 ease-in-out opacity-0`}
                  >
                    Custom PC <br />
                    Magician
                  </h1>
                  <h1
                    onClick={() => setActiveTab("")}
                    className={`theme-opacity absolute top-0 left-0 inset-0 text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-violet-700 via-blue-950 to-black bg-[60deg] font-serif text-[70px] mb-10 text-left transition-all duration-500 ease-in-out opacity-100`}
                  >
                    Custom PC <br />
                    Magician
                  </h1>
                </div>
              </button>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("Build a PC")}
                  className={
                    activeTab !== "Build a PC"
                      ? "w-full p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl h-[50px] bg-white rounded-full"
                      : "w-full p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl h-[50px] bg-slate-700 rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "Build a PC"
                        ? "text-gray-800"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 bg-[60deg]"
                    }
                  >
                    Build a PC
                  </p>
                </button>
              </section>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("View Builds by Price")}
                  className={
                    activeTab !== "View Builds by Price"
                      ? "w-full p-2 text-base sm:text-lg md:text-xl h-[50px] bg-white rounded-full"
                      : "w-full p-2 text-base sm:text-lg md:text-xl h-[50px] bg-slate-700 rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "View Builds by Price"
                        ? "text-gray-800"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 bg-[60deg]"
                    }
                  >
                    View Builds by Price
                  </p>
                </button>
              </section>
              <section className="font-serif w-full lg:w-60 mb-4 p-[1px] bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full">
                <button
                  onClick={() => setActiveTab("Community Builds")}
                  className={
                    activeTab !== "Community Builds"
                      ? "w-full p-2 text-lg sm:text-xl md:text-2xl h-[50px] bg-white rounded-full"
                      : "w-full p-2 text-lg sm:text-xl md:text-2xl h-[50px] bg-slate-700 rounded-full"
                  }
                >
                  <p
                    className={
                      activeTab !== "Community Builds"
                        ? "text-gray-800"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 bg-[60deg]"
                    }
                  >
                    Community Builds
                  </p>
                </button>
              </section>
            </header>
          </nav>
          <main className="flex-grow p-5 h-full z-10">
            {renderFormContent()}
          </main>
        </div>
      )}
    </>
  );
}

export default MainPage;
