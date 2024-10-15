'use client';

import { ComponentProps, useState } from 'react';

export default function BudgetQuotePage() {
    const [budget, setBudget] = useState<number | ''>(''); // 상태 초기화 하는

    const handleInputChange: ComponentProps<"input">["onChange"] = (e) => {
        const value = e.target.value; // 여기서는 문자열로 가져온당
        setBudget(value === '' ? '' : Number(value)); // 빈 문자열을 처리함
    };

    const handleSubmit = () => {
        if (budget !== '' && budget < 500000) {
            alert("예산은 최소 50만원 이상이어야 합니다.");
        }else{
            alert("성공");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen mt-0">
            <h2 className="text-3xl font-bold mb-2 text-pink-200">예산에 따른 견적 추천</h2>
            <p className="text-lg mb-4 text-gray-600">예산 입력해주세요 (최소 50만원 ~)</p>
            <input
                type="number"
                value={budget === '' ? '' : budget} // 사용자가 아무 것도 입력하지 않았을 때 number형이면 0으로 착각 할 수 있기 떄문에
                onChange={handleInputChange}
                className="w-1/3 p-2 mb-4 border border-gray-300 rounded"
                placeholder="예산 입력"
            />
            <button
                onClick={handleSubmit}
                className="w-1/3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                입력
            </button>
            <div className="h-48 w-full"></div>
        </div>
    );
}
