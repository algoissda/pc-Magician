'use client';

import { useState } from 'react';
import Build from './_components/Build a PC/Build';

function MainPage() {

    const [activeTab, setActiveTab] = useState<string>('Build a PC');

    const renderFormContent = () => {
        if (activeTab === 'Build a PC') {
            return (
                <Build />
            );
        } else if (activeTab === 'View Builds by Price') {
            return <h3 className="text-2xl font-semibold text-white">가격에 따른 빌드 보기</h3>;
        } else if (activeTab === 'Community Builds') {
            return <h3 className="text-2xl font-semibold text-white">커뮤니티 빌드</h3>;
        }
        return null;
    };

    return (
        <div className="flex bg-black min-h-screen">
            <div className="w-1/4 p-5 bg-gray-900 ">
              <div className='flex flex-col items-start justify-center ml-10 '>
                <p className='text-white text-4xl mb-10'>Custom PC <br/>
                  Magician
                </p>
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
