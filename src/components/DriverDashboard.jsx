import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle, XCircle, MoreVertical, LogOut, Phone, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { login, getMe } from '../api/auth';
import { getMyRides, updateRideStatus, getMyDriverProfile } from '../api/driver';

const DriverDashboard = ({ onAuthenticate, onPay, onScan, garageName, parkingTime, scannedCode, showGarageDetails, onCloseGarageDetails, onBack }) => {
    const [view, setView] = useState('login'); // login or dashboard
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [currentUser, setCurrentUser] = useState(null);
    const [students, setStudents] = useState([]); // This will hold the rides for today
    const [loadingData, setLoadingData] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            const user = await getMe();
            setCurrentUser(user);

            // Check if driver profile exists, maybe needed
            // const driverProfile = await getMyDriverProfile();

            setView('dashboard');
        } catch (err) {
            console.error(err);
            setError('فشل تسجيل الدخول. تأكد من المعلومات.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'dashboard') {
            fetchTodayRides();
        }
    }, [view]);

    const fetchTodayRides = async () => {
        setLoadingData(true);
        try {
            const data = await getMyRides();
            // Filter for today
            const today = new Date().toISOString().split('T')[0];
            const todaysRides = data.filter(r => r.date === today);

            // Map to the structure used in UI
            const mappedStudents = todaysRides.map(ride => ({
                id: ride.id,
                name: ride.rider_details?.user?.first_name
                    ? `${ride.rider_details.user.first_name} ${ride.rider_details.user.last_name || ''}`
                    : (ride.rider_details?.user?.username || 'Unknown'),
                location: ride.destination_details?.name || 'موقع غير محدد', // Or rider address if available
                status: ride.status === 'COMPLETED' ? 'present' : (ride.status === 'CANCELLED' ? 'absent' : 'pending'),
                paid: true, // Need check subscription payment status if available in ride details
                originalRide: ride
            }));

            setStudents(mappedStudents);

        } catch (err) {
            console.error("Error fetching rides", err);
        } finally {
            setLoadingData(false);
        }
    };


    const toggleStatus = async (id, currentStatus) => {
        // Toggle between COMPLETED (present) and SCHEDULED/pending.
        // If it's already present (COMPLETED), maybe we don't want to toggle back to pending easily?
        // Or if 'absent' (CANCELLED), maybe can't toggle?

        // Let's assume the button marks as Present (COMPLETED) if pending.
        const student = students.find(s => s.id === id);
        if (!student) return;

        let newStatus = '';
        if (student.status === 'pending') newStatus = 'COMPLETED';
        else if (student.status === 'present') newStatus = 'SCHEDULED'; // Undo?

        if (!newStatus) return; // Don't toggle absent ones for now

        // Optimistic update
        const oldStatus = student.status;
        setStudents(students.map(s => s.id === id ? { ...s, status: newStatus === 'COMPLETED' ? 'present' : 'pending' } : s));

        try {
            await updateRideStatus(id, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert
            setStudents(students.map(s => s.id === id ? { ...s, status: oldStatus } : s));
            alert("فشل تحديث الحالة");
        }
    };

    const handleSubstituteRequest = () => {
        const content = "السائق الحالي لا يمكنه توصيل الطلاب حالياً ويريد إرسال سائق بديل.";

        if (typeof my !== 'undefined' && my.confirm) {
            my.confirm({
                title: 'تأكيد طلب سائق بديل',
                content: content,
                confirmButtonText: 'تأكيد الطلب',
                cancelButtonText: 'إلغاء',
                success: (res) => {
                    if (res.confirm) {
                        if (my.showToast) my.showToast({ content: 'تم رفع الطلب للإدارة', type: 'success' });
                        else my.alert({ content: 'تم رفع الطلب للإدارة' });
                    }
                }
            });
        } else {
            if (confirm(content)) {
                alert('تم رفع الطلب للإدارة');
            }
        }
    }

    if (view === 'login') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Cairo']" dir="rtl">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-green-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">تسجيل دخول السائق</h2>
                        <p className="text-green-100">أدخل بيانات الحساب للمتابعة</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">اسم المستخدم</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-right"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-right"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all duration-300 flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                            {!loading && <ArrowRight className="mr-2 w-5 h-5" />}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition-colors"
                        >
                            العودة للشاشة الرئيسية
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Dashboard View
    return (
        <div className="min-h-screen bg-slate-50 font-['Cairo'] pb-24" dir="rtl">

            <div className="bg-white p-6 pb-4 shadow-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">مسار اليوم</h1>
                            <p className="text-slate-500 text-sm">{students.length} طلاب في القائمة</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="text-slate-600" />
                    </div>
                </div>
            </div>


            <div className="p-4 space-y-4">
                {loadingData && (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                )}

                {!loadingData && students.length === 0 && (
                    <div className="text-center p-8 text-slate-500">
                        لا توجد رحلات مجدولة اليوم.
                    </div>
                )}

                {students.map((student) => (
                    <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-50">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">{student.name}</h3>
                                {student.paid !== undefined && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${student.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {student.paid ? 'مشترك' : 'غير مشترك'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                <MapPin size={12} />
                                <span className="truncate max-w-[120px]">{student.location}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleStatus(student.id, student.status)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${student.status === 'present'
                                ? 'bg-green-50 text-green-600 ring-2 ring-green-100'
                                : student.status === 'absent'
                                    ? 'bg-red-50 text-red-600 ring-2 ring-100'
                                    : 'bg-slate-50 text-slate-300'
                                }`}
                        >
                            {student.status === 'present' ? <CheckCircle size={20} /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
                        </button>
                    </div>
                ))}
            </div>


            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
                <button
                    onClick={handleSubstituteRequest}
                    className="w-full border-2 border-red-100 text-red-600 bg-red-50 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut size={18} />
                    <span>طلب سائق بديل</span>
                </button>
            </div>
        </div>
    );
};

export default DriverDashboard;
