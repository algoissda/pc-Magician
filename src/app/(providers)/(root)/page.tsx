'use client';

import { useState } from 'react';
import Build from './_components/Build a PC/Build';
import CommunityBuilds from './_components/community_builds/page';
import ViewBuildsByPrice from './_components/view_builds_by_price/page';

function MainPage() {

    const [activeTab, setActiveTab] = useState<string>('');

    const renderFormContent = () => {
      if(activeTab === ''){
        return (
          <img src="https://img.freepik.com/premium-photo/black-computer-with-dark-black-background-illustration_626849-3282.jpg?w=900" alt="" />
        )
      }
        else if (activeTab === 'Build a PC') {
            return (
              //컴포넌트화
                <Build />
            );
        } else if (activeTab === 'View Builds by Price') {
            return(
              //컴포넌트화
              <ViewBuildsByPrice />
            );
        } else if (activeTab === 'Community Builds') {
            return (
              //컴포넌트화
              <CommunityBuilds />
            );
        }
        return null;
    };

    return (
        <div className="flex bg-black min-h-screen">
            <div className="w-1/4 p-5 bg-gray-900 ">
              <div className='flex flex-col items-start justify-center ml-10 '>
                <button>
                  <p onClick={() => setActiveTab('')} className='text-white text-4xl mb-10'>Custom PC <br/>
                    Magician
                  </p>
                </button>
                  <button onClick={() => setActiveTab('Build a PC')} className="mb-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-500">Build a PC</button>
                  <button onClick={() => setActiveTab('View Builds by Price')} className="mb-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-500">View Builds by Price</button>
                  <button onClick={() => setActiveTab('Community Builds')} className="mb-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-500">Community Builds</button>
              </div>
            </div>
            <div className="flex-grow p-5">
                {renderFormContent()}
            </div>
        </div>
    );
}

export default MainPage;
