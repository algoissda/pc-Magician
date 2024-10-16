'use client';

/* eslint-disable @next/next/no-img-element */
import { fetchProduct } from "@/api/products.api";
import { AiFillHeart } from "react-icons/ai"; // 하트 아이콘 임포트
import EstimateButton from "../_comtonents/estimateButton";

async function ProductPage(props) {
  const productId = props.params.productId;
  const product = await fetchProduct(productId);


  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gray-900">
      <div className="mb-4">
        <h2 className="text-center text-white text-4xl mb-5">{product?.product_name}</h2>
      </div>
      <div className="flex bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-full mx-4">
        <img
          className="w-1/3 rounded-lg"
          src={product?.image_url}
          alt={product?.product_name}
        />
        <div className="flex flex-col justify-between ml-8 w-2/3">
          <div>
            <p className="text-white text-2xl font-bold">
              {product?.product_name}
            </p>
            <p className="mt-5 text-xl text-white">{product?.type}</p>
            <p className="mt-5 text-red-500 text-xl">
              PRICE : {product?.price.toLocaleString()}₩
            </p>
          </div>

          <button className="flex items-center mt-4">
            <AiFillHeart className="text-red-500 text-2xl mr-2" />
            <span className="text-white">관심 상품 추가</span>
          </button>

          <div className="flex flex-col mt-4 space-y-2">
            <div className="flex justify-between">
              {/* 버튼 컴포넌트화 시켜서 오류 없앴음 */}
              <EstimateButton productName={product?.product_name} />
            </div>
          </div>
        </div>
      </div>
    </main>

  );
}

export default ProductPage;
