import { supabase } from "../../../../../../supabase/client";

async function MySavedBuildsPage() {

  const response = await supabase.from("builds").select("*");
  const data = response.data;
  console.log("111111111",data);

  return (
    <main className="text-white">
      <h2 className="mt-10 text-3xl font-bold ml-20">저장된 견적</h2>

      <div className="max-h-max">
        <div className="flex flex-wrap justify-start mt-8 mx-20 ">
          <div className="border p-4 m-2 w-1/3 max-w-xs flex flex-col justify-between">
            <h3 className="ml-5">sangki</h3>
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
      </div>

    </main>
  );
}

export default MySavedBuildsPage;
