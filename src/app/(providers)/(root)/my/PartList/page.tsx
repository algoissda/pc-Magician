import { getProducts } from "@/api/products.api";
import Link from "next/link";


async function PartListPage() {
    const products = await getProducts();

    return (
        <main className=" px-5 lg:px-8 flex flex-col grow w-full items-stretch py-6 lg:py-10 max-w-screen-lg mx-auto">
            <h2 className="font-bold text-3xl text-center my-1 text-pink-200">
              추천 부품들 - 전체 카테고리
            </h2>
            <ul className="mt-20 grid grid-cols-4 gap-x-8 gap-y-32">
            {products?.map((product) => (
              <Link key={product.id}
                href={`/products/${product.id}`}
                className="text-white transition transform hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
              >
                <p>{product.type}</p>
                <img className="w-[100%] h-[60%]" src={product.image_url} alt="" />
                <p>
                  {product.product_name}
                </p>
                <br />
                <p className="font-bold">
                최저가 : {product.price ? product.price.toLocaleString() : '가격 정보 없음'}₩
              </p>
              </Link>
              ))}
            </ul>
    </main>
    );
}

export default PartListPage;
