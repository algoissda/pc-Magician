// "use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";
import Product from "../../../../types/products.type";
import { supabase } from "../../../../supabase/client";

interface ProductsListProps {
  products: Product[];
}

function MainPage({ products }: ProductsListProps) {
  supabase.from("products").select("*");
  return (
    <main className=" px-5 lg:px-8 flex flex-col grow w-full items-stretch py-6 lg:py-10 max-w-screen-lg mx-auto">
      {products &&
        products.map((product) => (
          <ul key={product.id}>
            <h2 className="font-bold text-3xl text-center my-1 text-pink-200">
              추천 부품들 - {product.type} 카테고리
            </h2>
            <ul className="mt-20 grid grid-cols-4 gap-x-8 gap-y-32">
              <Link
                href={"/product"}
                className="text-white transition transform hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
              >
                그래픽카드
                {product.image_url}
                <p>
                  {" "}
                  GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory
                  WINDFORCE 2X with Blade Fan Design
                </p>
                <br />
                <p className="font-bold">PRICE : 999$</p>
              </Link>
            </ul>
          </ul>
        ))}
    </main>
  );
}

export default MainPage;
