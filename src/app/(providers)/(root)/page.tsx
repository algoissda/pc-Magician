'use client';

import { useState } from 'react';

function MainPage() {

    const [activeTab, setActiveTab] = useState<string>('Build a PC');

    const renderFormContent = () => {
        if (activeTab === 'Build a PC') {
            return (
                <div className="flex">
                    <div className="w-1/3 pr-4">
                        <h3 className="text-2xl font-semibold text-white mb-3">부품 목록</h3>
                        <div className='rounded-lg border border-gray-500 p4'>
                          <ul className=" pl-5 pr-5 text-gray-300 pb-6 pt-2">
                              <li>CPU</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>VGA</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>RAM</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>Motherboard</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>SSD</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>HDD</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>Power Supply</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>Cooler</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>
                              <li>Case</li>
                              <li className='border-b border-b-gray-500 pb-5'></li>

                          </ul>
                        </div>
                    </div>
                    <div className="w-2/3">
                        <h3 className="text-2xl font-semibold text-white">예산</h3>
                        <input
                            type="number"
                            className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
                            placeholder="예산 입력"
                        />
                        <h3 className="text-2xl font-semibold text-white">CPU 선호</h3>
                        <select className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded">
                            <option value="">선호하는 CPU를 선택하세요</option>
                            <option value="Intel">Intel</option>
                            <option value="AMD">AMD</option>
                        </select>
                        <h3 className="text-2xl font-semibold text-white">GPU 선호</h3>
                        <select className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded">
                            <option value="">선호하는 GPU를 선택하세요</option>
                            <option value="NVIDIA">NVIDIA</option>
                            <option value="AMD">AMD</option>
                        </select>
                        <h3 className="text-2xl font-semibold text-white">사용 용도</h3>
                        <textarea className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded" placeholder="용도를 입력하세요"></textarea>

                        <button className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-500">
                            RUN
                        </button>
                    </div>
                </div>
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
