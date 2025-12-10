import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('/auth/register', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        googleLogout();
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const { data } = await axios.post('/auth/google', { token: tokenResponse.credential || tokenResponse.access_token });
                // NOTE: If using access_token/implicit flow, backend verification differs from id_token.
                // @react-oauth/google useGoogleLogin default gives access_token.
                // GoogleLogin component gives credential (id_token).
                // Let's assume we handle the token appropriately based on what we get.
                // Ideally we use id_token for backend verification if possible.
                // Changing to GoogleLogin component in UI might be easier for id_token, 
                // OR we just send the access token to backend and backend calls Google UserInfo API.

                // Let's stick to standard flow: verify id_token if available (GoogleLogin component)
                // OR verify access_token (useGoogleLogin hook).
                // For 'useGoogleLogin' flow (custom button), we get access_token.
                // We'll update backend logic to fetch user info if it's not a JWT id_token.
                // Actually simplest is just pass whatever token and backend figures it out or fetch info here.

                // Let's actually fetch the user info HERE if it's access_token flow, then send to backend?
                // No, backend should verify.

                // Updated plan: The backend currently expects `idToken`. 
                // If I use `useGoogleLogin`, I get an access token.
                // I should switch backend to verify access token OR swap to using the GoogleLogin component which gives idToken.
                // I'll stick to `useGoogleLogin` for custom UI button, and handle the access_token in backend validation properly
                // OR just fetch user profile here and send to backend as a trusted "social login" (less secure but easier for this POC)
                // OR better: backend calls https://www.googleapis.com/oauth2/v3/userinfo

                // I will update backend auth.js slightly to handle this if needed, 
                // but for now let's try assuming we send the right thing.
                // Actually, let's just use GoogleLogin component in the UI unless custom styling is critical.
                // User asked for "proper add login using google".

                // Let's assume we implement the GoogleLogin component in the Login page. 
                // Here I'll just expose a helper or maybe we don't need a global googleLogin function here if the component handles it.
                // Actually, centralizing the "after success" logic is good.

                localStorage.setItem('userInfo', JSON.stringify(data));
                setUser(data);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            } catch (error) {
                console.error(error);
            }
        },
        onError: error => console.log('Login Failed:', error)
    });

    // Helper for components to call after Google component success
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await axios.post('/auth/google', { token: credentialResponse.credential });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        } catch (error) {
            console.error("Google auth error", error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        handleGoogleSuccess
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
