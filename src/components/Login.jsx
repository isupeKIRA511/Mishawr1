import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { login, getMe } from '../api/auth';

const Login = () => {
    const navigate = useNavigate();
    
    const checkLogin = async () => {
        const storedUser = localStorage.getItem('access');
        if (storedUser) {
            // Try Get User role from api using token
            try {
                const user = await getMe();
                const role = user.role ? user.role.toLowerCase() : '';
                console.log("User Role:", user.role);

                switch (role) {
                    case 'student':
                    case 'passenger':
                        navigate('/student-dashboard');
                        break;
                    case 'driver':
                        navigate('/driver-dashboard');
                        break;
                    case 'parent':
                        navigate('/parent-dashboard');
                        break;
                    default:
                        throw new Error(`Role not recognized: ${user.role}`);
                }
            } catch (err) {
                console.error(err);
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Clear existing tokens
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');

            // 1. Attempt Login
            try {
                await login(formData.username, formData.password);
            } catch (loginErr) {
                console.error("Login Call Failed:", loginErr);
                // Extract error message
                const data = loginErr.response?.data?.data || loginErr.response?.data;
                const msg = data?.message || data?.detail || 'اسم المستخدم أو كلمة المرور غير صحيحة';
                throw new Error(msg);
            }

            // 2. Fetch User Profile
            let user;
            try {
                user = await getMe();
            } catch (profileErr) {
                console.error("GetMe Call Failed:", profileErr);
                throw new Error("فشل جلب بيانات المستخدم");
            }

            // Redirect
            // Redirect
            const role = user.role ? user.role.toLowerCase() : '';
            console.log("User Role:", user.role);

            switch (role) {
                case 'student':
                case 'passenger':
                    navigate('/student-dashboard');
                    break;
                case 'driver':
                    navigate('/driver-dashboard');
                    break;
                case 'parent':
                    navigate('/parent-dashboard');
                    break;
                default:
                    throw new Error(`Role not recognized: ${user.role}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Cairo']" dir="rtl">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
                    <p className="text-blue-100">أدخل بيانات الحساب للمتابعة</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm border border-red-100 flex items-center justify-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-right"
                                placeholder="أدخل اسم المستخدم"
                                required
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-right"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                        {!loading && <ArrowRight className="mr-2 w-5 h-5" />}
                    </button>

                    <div className="text-center mt-6 pt-6 border-t border-slate-100">
                        <p className="text-slate-500 text-sm mb-2">ليس لديك حساب؟</p>
                        <Link
                            to="/register"
                            className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                            إنشاء حساب جديد
                            <ChevronLeft size={16} />
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
