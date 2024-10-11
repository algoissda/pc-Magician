'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '../../../../zustand/auth.store';
import { supabase } from '../../../../supabase/client';

function AuthProvider({children}: PropsWithChildren) {
    const logIn = useAuthStore((state) => state.logIn);
    const logOut = useAuthStore((state) => state.logOut);

    useEffect(() => {
        (async() => {
            await supabase.auth.onAuthStateChange((_event, session) => {
                if(session?.user){
                    logIn()
                }else{
                    logOut();
                }
            })
        })();
    } ,[logIn, logOut ])

    return children;
}

export default AuthProvider