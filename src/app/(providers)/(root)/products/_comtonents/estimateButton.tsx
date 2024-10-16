import { Database } from '../../../../../../database.types';
import { supabase } from '../../../../../../supabase/client';

interface EstimateButtonProps {
    productName?: string;
}

function EstimateButton({ productName } : EstimateButtonProps) {

    const handleClickEstimateButton = async () => {

        const {data: {session}} = await supabase.auth.getSession();
        const userId = session?.user?.id;

            if(!userId){
                console.error("사용자 ID가 없습니다");
                return;
            }

        const data: Database["public"]["Tables"]["estimate"]["Insert"] = {
                userId,
                productName : String(productName),
            }
        const response = await supabase.from("estimate").insert(data);
        console.log(response.data);

    }
    return (

        <button onClick={handleClickEstimateButton} className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 w-full text-lg">
            내 견적에 추가
        </button>
    )
}

export default EstimateButton