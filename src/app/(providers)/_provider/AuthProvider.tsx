'use client';

import { PropsWithChildren, useEffect } from 'react';
import { supabase } from '../../../../supabase/client';
import { useAuthStore } from '../../../../zustand/auth.store';

function AuthProvider({children}: PropsWithChildren) {
    const logIn = useAuthStore((state) => state.logIn);
    const logOut = useAuthStore((state) => state.logOut);
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        (async() => {
            await supabase.auth.onAuthStateChange((_event, session) => {
                if(session?.user){
                    logIn()
                }else{
                    logOut();
                }
                initAuth();
            })
        })();
    } ,[logIn, logOut, initAuth])

    return children;
}

export default AuthProvider