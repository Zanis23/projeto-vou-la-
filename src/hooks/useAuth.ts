import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { MOCK_USER } from '../constants';
import { db } from '@/utils/storage';

export function useAuth() {
    const [appState, setAppState] = useState<'LOADING' | 'LOGIN' | 'MAIN' | 'BUSINESS_REG'>('LOADING');
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);

    const loadUserData = useCallback(async (optimisticUser?: User) => {
        const fetchedUser = optimisticUser || await db.user.get();
        setCurrentUser(fetchedUser);
        return fetchedUser;
    }, []);

    const initAuth = useCallback(async () => {
        try {
            const sessionUser = await db.auth.getSession();
            if (sessionUser) {
                setCurrentUser(sessionUser);
                setAppState('MAIN');
            } else {
                // If no real session, force login even if flag exists
                setAppState('LOGIN');
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
            setAppState('LOGIN');
        }
    }, [loadUserData]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = (user: User) => {
        setCurrentUser(user);
        setAppState('MAIN');
    };

    const logout = async () => {
        await db.auth.logout();
        localStorage.removeItem('voula_logged_in'); // Cleanup legacy flag
        setAppState('LOGIN');
        setCurrentUser(MOCK_USER);
    };

    return {
        appState,
        setAppState,
        currentUser,
        setCurrentUser,
        login,
        logout,
        loadUserData
    };
}
