import { supabase } from "../../supabase/client";

export async function getProducts(){
    const response = await supabase.from("products").select("*");
    const data = response.data;
    console.log(data);
    return data;
}

