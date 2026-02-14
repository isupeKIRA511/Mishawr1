import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle, LogOut, Loader2, FileText, Bus, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout } from '../api/auth';
import { getMyRides, updateRideStatus, getMyDriverProfile, registerDriverProfile } from '../api/driver';
import { getDestinations } from '../api/destinations';

const DriverDashboard = ({ onScan }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [driverProfile, setDriverProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Profile Creation State
    const [destinations, setDestinations] = useState([]);
    const [profileData, setProfileData] = useState({
        vehicle_model: '',
        license_plate: '',
        license_number: '',
        destination: '',
        zone: 1,
        capacity: 4
    });
    const [idPicture, setIdPicture] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [submittingProfile, setSubmittingProfile] = useState(false);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const user = await getMe();
                setCurrentUser(user);

                // Check for driver profile
                const profile = await getMyDriverProfile();
                setDriverProfile(profile);

                if (profile) {
                    fetchTodayRides();
                } else {
                    // Fetch destinations for profile form
                    fetchDestinations();
                }

            } catch (err) {
                console.error("Auth failed", err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        const fetchDestinations = async () => {
            try {
                const dests = await getDestinations();
                setDestinations(dests);
                if (dests.length > 0) setProfileData(prev => ({ ...prev, destination: dests[0].name }));
            } catch (err) { console.error(err); }
        };

        initDashboard();
    }, [navigate]);

    const fetchTodayRides = async () => {
        setLoadingData(true);
        try {
            const data = await getMyRides();
            // Filter for today
            const today = new Date().toISOString().split('T')[0];
            const todaysRides = data.filter(r => r.date === today);

            const mappedStudents = todaysRides.map(ride => ({
                id: ride.id,
                name: ride.rider_details?.user?.first_name
                    ? `${ride.rider_details.user.first_name} ${ride.rider_details.user.last_name || ''}`
                    : (ride.rider_details?.user?.username || 'Unknown'),
                location: ride.destination_details?.name || 'موقع غير محدد',
                status: ride.status === 'COMPLETED' ? 'present' : (ride.status === 'CANCELLED' ? 'absent' : 'pending'),
                paid: true,
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
        const student = students.find(s => s.id === id);
        if (!student) return;

        // If already completed, maybe don't toggle back in this simple specific flow, or allow undo
        let newStatus = '';
        if (student.status === 'pending') newStatus = 'COMPLETED';

        if (!newStatus) return;

        // Optimistic update
        const oldStatus = student.status;
        setStudents(students.map(s => s.id === id ? { ...s, status: 'present' } : s));

        try {
            await updateRideStatus(id, newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            setStudents(students.map(s => s.id === id ? { ...s, status: oldStatus } : s));
            alert("فشل تحديث الحالة");
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSubmittingProfile(true);

        try {
            const formData = new FormData();
            formData.append('vehicle_model', profileData.vehicle_model);
            formData.append('license_plate', profileData.license_plate);
            formData.append('license_number', profileData.license_number);
            formData.append('destination', profileData.destination);
            formData.append('zone', profileData.zone);
            formData.append('capacity', profileData.capacity);
            formData.append('available_weekdays', JSON.stringify([0, 1, 2, 3, 4])); // Default weekdays

            if (idPicture) formData.append('id_picture', idPicture);
            if (profilePicture) formData.append('profile_picture', profilePicture);

            const profile = await registerDriverProfile(formData);
            setDriverProfile(profile);
            alert("تم إرسال بياناتك بنجاح! حسابك قيد المراجعة.");
            // Refresh to show dashboard (empty rides initially)
            fetchTodayRides();

        } catch (err) {
            console.error(err);
            alert("فشل الحفظ. تأكد من جميع البيانات.");
        } finally {
            setSubmittingProfile(false);
        }
    };


    const handleSubstituteRequest = () => {
        if (confirm("هل تريد طلب سائق بديل؟")) {
            alert('تم رفع الطلب للإدارة');
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            </div>
        );
    }

    // --- COMPLETE PROFILE VIEW ---
    if (!driverProfile) {
        return (
            <div className="min-h-screen bg-slate-50 font-['Cairo'] p-4" dir="rtl">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                            <Car size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">إكمال ملف السائق</h1>
                        <p className="text-slate-500 text-sm">يرجى تعبئة بيانات المركبة للبدء بالعمل</p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">نوع السيارة وموديلها</label>
                            <input type="text" name="vehicle_model" required onChange={handleProfileChange} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="مثال: تويوتا كامري 2020" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">رقم اللوحة</label>
                                <input type="text" name="license_plate" required onChange={handleProfileChange} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="بغداد ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">رقم الإجازة</label>
                                <input type="text" name="license_number" required onChange={handleProfileChange} className="w-full p-3 border rounded-xl bg-slate-50" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">خط الوجهة</label>
                            <select name="destination" required onChange={handleProfileChange} className="w-full p-3 border rounded-xl bg-slate-50">
                                {destinations.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">المنطقة السكنية (Zone ID)</label>
                                <input type="number" name="zone" required onChange={handleProfileChange} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">عدد المقاعد</label>
                                <input type="number" name="capacity" required onChange={handleProfileChange} value={profileData.capacity} className="w-full p-3 border rounded-xl bg-slate-50" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">صورة الإجازة / الهوية</label>
                            <input type="file" accept="image/*" onChange={(e) => setIdPicture(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">صورة شخصية (اختياري)</label>
                            <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <button
                            type="submit"
                            disabled={submittingProfile}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {submittingProfile ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD ---
    return (
        <div className="min-h-screen bg-slate-50 font-['Cairo'] pb-24" dir="rtl">

            <div className="bg-white p-6 pb-4 shadow-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">مسار اليوم</h1>
                            <p className="text-slate-500 text-sm">{students.length} طلاب في القائمة</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {driverProfile?.profile_picture ? (
                            <img src={driverProfile.profile_picture} alt="Driver" className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-slate-600" />
                        )}
                    </div>
                </div>
                {driverProfile?.status === 'PENDING' && (
                    <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded-lg mt-2 text-center border border-yellow-200">
                        حسابك قيد المراجعة من قبل الإدارة.
                    </div>
                )}
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
