import React, { useState, useEffect, useCallback } from 'react';
import type { User, Page } from './types';
import { Role } from './types';
import type { Transaction } from './types';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import Button from './components/common/Button';
import Input from './components/common/Input';
import { usePartsDB } from './hooks/usePartsDB';

const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 003.375-3.375h9.75a3.375 3.375 0 003.375 3.375v1.875m-17.25 4.5h14.625c.621 0 1.125-.504 1.125-1.125V14.25m-14.625 4.5L5.625 15m12.75 3.75l-1.5-3.75M6 12l-2.25-4.5m14.25 4.5l2.25-4.5M12 6.75l-2.25-4.5M12 6.75l2.25-4.5" />
    </svg>
);


interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <CarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400"/>
                        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">AutoParts Finder</span>
                    </div>
                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 dark:text-gray-300 hidden sm:block">
                                Welcome, <span className="font-semibold">{user.email}</span>
                            </span>
                            <button
                                onClick={onLogout}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

interface AuthFormProps {
    page: Page;
    setPage: React.Dispatch<React.SetStateAction<Page>>;
    onAuth: (email: string, pass: string, name?: string, phone?: string, role?: Role) => void;
    authError: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ page, setPage, onAuth, authError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [signupRole, setSignupRole] = useState<Role>(Role.Customer);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAuth(email, password, name, phone, signupRole);
    };

    const isLoginPage = page === 'login';

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-100 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <CarIcon className="mx-auto h-12 w-auto text-indigo-600 dark:text-indigo-400"/>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {isLoginPage ? 'Sign in to your account' : 'Create a new account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Or{' '}
                    <button onClick={() => setPage(isLoginPage ? 'signup' : 'login')} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        {isLoginPage ? 'create a customer account' : 'sign in to your account'}
                    </button>
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLoginPage && (
                            <>
                                <Input id="name" label="Full name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                <Input id="phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                <div className="flex gap-4 items-center">
                                  <label className="flex items-center gap-2"><input type="radio" checked={signupRole===Role.Customer} onChange={() => setSignupRole(Role.Customer)} /> Customer</label>
                                  <label className="flex items-center gap-2"><input type="radio" checked={signupRole===Role.StoreOwner} onChange={() => setSignupRole(Role.StoreOwner)} /> Store owner</label>
                                </div>
                            </>
                        )}
                        <Input id="email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
                        <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={isLoginPage ? "current-password" : "new-password"}/>
                        
                        {authError && <p className="text-red-500 text-sm">{authError}</p>}
                        
                        <div>
                            <Button type="submit">{isLoginPage ? 'Sign in' : 'Create account'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


function App() {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('login');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addOrUpdateParts, searchParts, getAllParts, buyPart, getTransactions } = usePartsDB();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogin = useCallback((email: string, pass: string) => {
        setAuthError(null);
        if (email.toLowerCase() === 'admin@example.com' && pass === 'admin123') {
            const adminUser: User = { id: 'admin', email, role: Role.Admin };
            localStorage.setItem('user', JSON.stringify(adminUser));
            setUser(adminUser);
            return;
        }
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const found = users.find(u => u.email === email);
        // In a real app, passwords would be hashed. For this demo, we check plaintext.
        if (found && localStorage.getItem(`pass_${email}`) === pass) {
            localStorage.setItem('user', JSON.stringify(found));
            setUser(found);
        } else {
            setAuthError('Invalid email or password.');
        }
    }, []);

    const handleSignup = useCallback((email: string, pass: string, name?: string, phone?: string, role?: Role) => {
        setAuthError(null);
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(c => c.email === email) || email.toLowerCase() === 'admin@example.com') {
            setAuthError('An account with this email already exists.');
            return;
        }

        const newUser: User = { id: `u_${Date.now()}`, email, role: role || Role.Customer, name, phone };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem(`pass_${email}`, pass); // Storing pass in LS is insecure, for demo only.
        
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    }, []);
    
    const handleAuth = (email: string, pass: string, name?: string, phone?: string, role?: Role) => {
        if (page === 'login') {
            handleLogin(email, pass);
        } else {
            handleSignup(email, pass, name, phone, role);
        }
    }

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
        setPage('login');
    }, []);
    
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><p className="text-white">Loading...</p></div>;
    }

    if (!user) {
        return <AuthForm page={page} setPage={setPage} onAuth={handleAuth} authError={authError}/>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header user={user} onLogout={handleLogout} />
            <main>
                {user.role === Role.Admin ? (
                    <AdminDashboard username={user.email} onUpload={addOrUpdateParts} isAdmin />
                ) : user.role === Role.StoreOwner ? (
                    <AdminDashboard username={user.email} onUpload={(parts) => addOrUpdateParts(parts, user.id)} />
                ) : (
                    <CustomerDashboard username={user.email} searchParts={searchParts} getAllParts={getAllParts} onBuy={(partNumber, qty) => {
                        try {
                            const tx = buyPart(partNumber, qty, user.id);
                            // optional: show toast or console
                            console.log('Purchase recorded', tx);
                        } catch (err) {
                            console.error('Purchase failed', err);
                        }
                    }} />
                )}
            </main>
        </div>
    );
}

export default App;
