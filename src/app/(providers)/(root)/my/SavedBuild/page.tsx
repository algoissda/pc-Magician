import { supabase } from "../../../../../../supabase/client";

async function MySavedBuildsPage() {

  const response = await supabase.from("builds").select("*");
  const data = response.data;
  console.log("111111111",data);

  {}
  return (
    <main className="text-white">
      <h2 className="mt-10 text-3xl font-bold ml-20">저장된 견적</h2>

      <div className="h-[805px]">
        <p className="mt-10 mx-20">{}</p>
      </div>
    </main>
  );
}

export default MySavedBuildsPage;
