import { supabase } from "../../supabase/client";
import Product from "../../types/products.type";


export async function getProducts(){
    const response = await supabase.from("products").select("*").limit(221300);
    const data = response.data;
    return data;
}


export async function fetchProduct(id: number): Promise<Product | null> {
    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
    return data;
}

