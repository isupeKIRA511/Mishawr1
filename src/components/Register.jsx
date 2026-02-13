import React, { useState } from 'react';
import { User, Bus, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../api/auth';

const Register = ({ onBack, onRegisterSuccess }) => {
    const [role, setRole] = useState('PASSENGER'); // PASSENGER, DRIVER, PARENT
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone_number: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                role: role
            };
            await registerUser(payload);
            alert("تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.");
            if (onRegisterSuccess) onRegisterSuccess(role);
        } catch (err) {
            console.error(err);
            setError("فشل إنشاء الحساب. تأكد من صحة البيانات أو حاول مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Cairo']" dir="rtl">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">إنشاء حساب جديد</h2>
                    <p className="text-slate-400">اختر نوع الحساب وأدخل بياناتك</p>
                </div>

                <div className="p-8">
                    {/* Role Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => setRole('PASSENGER')}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${role === 'PASSENGER' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            <User className="mb-2" />
                            <span className="text-sm font-bold">طالب/راكب</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('DRIVER')}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${role === 'DRIVER' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            <Bus className="mb-2" />
                            <span className="text-sm font-bold">سائق</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('PARENT')}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${role === 'PARENT' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                        >
                            <Users className="mb-2" />
                            <span className="text-sm font-bold">ولي أمر</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المستخدم</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف (+964...)</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                placeholder="+9647..."
                                dir="ltr"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                            {!loading && <CheckCircle2 size={20} />}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
                        >
                            العودة
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
