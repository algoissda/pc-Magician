'use client';

import { useState } from "react";
import { supabase } from "../../../../../supabase/client";

function PostPage() {

    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleClickSubmitButton = async () => {

        try{
            const {data:{user}, error: userError} = await supabase.auth.getUser();

            if(userError){
                throw userError;
            }

            const {data, error} = await supabase.from('post').insert([{
                type: String(type),
                title: String(title),
                content: String(content),
                like: 0,
                created_at: new Date().toISOString(),
                uid: user ? user.id : null

            }]);

            if(error){
                throw error
            }

            console.log("aaaaaaa", data);
            setType('');
            setTitle('');
            setContent('');

        }catch(error){
            console.error(error);
        }
    }

  return (
    <div className="bg-gray-500">
        <input value={type} onChange={(e) => setType(e.target.value)} type="text" placeholder='타입' className='text-black bg-white' />
        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder='제목' className='text-black bg-white' />
        <input value={content} onChange={(e) => setContent(e.target.value)} type="text" placeholder='본문' className='text-black bg-white' />
        <button onClick={handleClickSubmitButton} className="bg-white">제출버튼</button>
    </div>
  )
}

export default PostPage

