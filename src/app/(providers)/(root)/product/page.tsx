
import { AiFillHeart } from "react-icons/ai"; // 하트 아이콘 임포트

function ProductPage() {
  return(

    <main className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="flex bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-full mx-4">
        <img
          className="w-1/3 rounded-lg"
          src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
          alt="Graphics Card"
        />
        <div className="flex flex-col justify-between ml-8 w-2/3">
          <div>
            <p className="text-white text-2xl font-bold">
              GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
              2X with Blade Fan Design
            </p>
            <p className="mt-5 text-red-500 text-xl">PRICE : 999$</p>
            <p className="mt-5 text-xl text-white" text-white text-xl>블라블라</p>
            <p className="mt-5 text-xl text-white" text-white text-xl>blabla</p>
          </div>



          <button className="flex items-center mt-4">
            <AiFillHeart className="text-red-500 text-2xl mr-2" />
            <span className="text-white">관심 상품 추가</span>
          </button>

          <div className="flex flex-col mt-4 space-y-2">
            <div className="flex justify-between">
              <button className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 w-full mr-2 text-lg">
                장바구니 담기
              </button>
              <button className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 w-full text-lg">
                내 견적
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>







  );
}

export default ProductPage;
