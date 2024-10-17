'use client';

import { ComponentProps, useState } from "react";

function Build() {


    const [estimateType , setEstimateType] = useState("");
    const [cpuType, setCpuType] = useState("");
    const [gpuType, setGpuType] = useState("");
    const [useType, setUseType] = useState("");

    const handleChangeEstimateType: ComponentProps<"input">["onChange"] = (e) => {
      setEstimateType(e.target.value);
    }
    const handleChangeCpuType: ComponentProps<"select">["onChange"] = (e) => {
      setCpuType(e.target.value);
    }
    const handleChangeGpuType: ComponentProps<"select">["onChange"] = (e) => {
      setGpuType(e.target.value);
    }
    const handleChangeUseType: ComponentProps<"select">["onChange"] = (e) => {
      setUseType(e.target.value);
    }
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
            <input value={estimateType} onChange={handleChangeEstimateType}
                type="number"
                className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
                placeholder="예산 입력"
            />
            <h3 className="text-2xl font-semibold text-white">CPU 선호</h3>
            <select value={cpuType} onChange={handleChangeCpuType} className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded">
                <option value="">선호하는 CPU를 선택하세요</option>
                <option value="Intel">Intel</option>
                <option value="AMD">AMD</option>
            </select>
            <h3 className="text-2xl font-semibold text-white">GPU 선호</h3>
            <select value={gpuType} onChange={handleChangeGpuType} className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded">
                <option value="">선호하는 GPU를 선택하세요</option>
                <option value="NVIDIA">NVIDIA</option>
                <option value="AMD">AMD</option>
            </select>
            <h3 className="text-2xl font-semibold text-white">사용 용도</h3>
            <select value={useType} onChange={handleChangeUseType} className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded">
              <option value="">용도를 선택해주세요</option>
              <option value="사용">무사무용</option>
              <option value="게임용">게임용</option>
              <option value="3D렌더링용">3D렌더링용</option>
              <option value="영상편집용">영상편집용</option>
              <option value="그래픽디자인용">그래픽디자인용</option>
              <option value="사내서버용">사내서버용</option>
            </select>
            <button className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-500">
                RUN
            </button>
        </div>
    </div>
  )
}

export default Build