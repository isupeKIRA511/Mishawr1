/**
 * Mock API data and resolver. Used by the axios mock adapter to return
 * realistic responses without hitting the backend. Backend integration
 * remains in place; this layer only intercepts requests at runtime.
 */

// Simulated network delay (ms) for the illusion of backend communication
const MIN_DELAY = 280;
const MAX_DELAY = 720;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const randomDelay = () => delay(MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));

// Current user after "login" - set by mock login so GET users/me returns this
let currentMockUser = null;

const mockUsers = {
  student1: {
    id: 1,
    username: 'student1',
    first_name: 'أحمد',
    last_name: 'الطالب',
    role: 'PASSENGER',
    phone_number: '+9647701234567',
    email: 'student1@example.com',
    unique_id: 'STU001',
  },
  driver1: {
    id: 2,
    username: 'driver1',
    first_name: 'محمد',
    last_name: 'السائق',
    role: 'DRIVER',
    phone_number: '+9647702234567',
    email: 'driver1@example.com',
  },
  parent1: {
    id: 3,
    username: 'parent1',
    first_name: 'علي',
    last_name: 'ولي الأمر',
    role: 'PARENT',
    phone_number: '+9647703234567',
    email: 'parent1@example.com',
    children: [1], // linked passenger ids
  },
  // Default for any other username (e.g. after register)
  default: {
    id: 10,
    username: 'user',
    first_name: 'مستخدم',
    last_name: 'تجريبي',
    role: 'PASSENGER',
    phone_number: '+9647700000000',
    email: 'user@example.com',
  },
};

const childUsers = {
  1: {
    id: 1,
    username: 'student1',
    first_name: 'أحمد',
    last_name: 'الطالب',
    role: 'PASSENGER',
    phone_number: '+9647701234567',
    unique_id: 'STU001',
  },
};

const mockDestinations = [
  { id: 1, name: 'جامعة بغداد', arrival_time: '08:30:00', latitude: 33.27, longitude: 44.375 },
  { id: 2, name: 'الجامعة التكنولوجية', arrival_time: '08:00:00', latitude: 33.28, longitude: 44.38 },
  { id: 3, name: 'جامعة النهرين', arrival_time: '09:00:00', latitude: 33.26, longitude: 44.37 },
];

const mockDrivers = [
  {
    id: 1,
    user: { id: 2, first_name: 'محمد', last_name: 'السائق', username: 'driver1' },
    vehicle_model: 'تويوتا كامري',
    license_plate: 'بغداد ١٢٣٤٥٦',
    rating: 4.8,
    status: 'APPROVED',
    destination: 'جامعة بغداد',
    zone: 1,
    capacity: 4,
    profile_picture: null,
  },
  {
    id: 2,
    user: { id: 4, first_name: 'خالد', last_name: 'السائق', username: 'driver2' },
    vehicle_model: 'هيونداي النترا',
    license_plate: 'بغداد ٧٨٩٠١٢',
    rating: 4.5,
    status: 'APPROVED',
    destination: 'جامعة بغداد',
    zone: 1,
    capacity: 3,
    profile_picture: null,
  },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function buildRide(overrides = {}) {
  const date = overrides.date || getToday();
  return {
    id: overrides.id ?? 100 + Math.floor(Math.random() * 900),
    status: overrides.status ?? 'SCHEDULED',
    date,
    pickup_time: overrides.pickup_time ?? '07:45:00',
    rider_details: {
      user: {
        first_name: currentMockUser?.first_name ?? 'أحمد',
        last_name: currentMockUser?.last_name ?? 'الطالب',
        username: currentMockUser?.username ?? 'student1',
      },
      pickup_latitude: 33.3152,
      pickup_longitude: 44.3661,
    },
    driver_details: {
      user: { first_name: 'محمد', last_name: 'السائق' },
      vehicle_model: 'تويوتا كامري',
      license_plate: 'بغداد ١٢٣٤٥٦',
    },
    destination_details: { id: 1, name: 'جامعة بغداد', arrival_time: '08:30:00' },
    ...overrides,
  };
}

function buildSubscription(overrides = {}) {
  return {
    id: overrides.id ?? 50 + Math.floor(Math.random() * 50),
    driver_id: 1,
    driver_details: mockDrivers[0],
    destination_details: mockDestinations[0],
    weekdays: [0, 1, 2, 3, 4],
    amount: 85000,
    payment_status: overrides.payment_status ?? 'PENDING',
    start_date: getToday(),
    ...overrides,
  };
}

function getMockRides(riderId = null) {
  const today = getToday();
  const base = [
    buildRide({ date: today, status: 'SCHEDULED' }),
    buildRide({ date: today, id: 102, pickup_time: '07:30:00', status: 'COMPLETED' }),
    buildRide({ date: getNextWeekday(today, 1), status: 'SCHEDULED' }),
    buildRide({ date: getNextWeekday(today, 2), status: 'SCHEDULED' }),
  ];
  return riderId ? base : base;
}

function getNextWeekday(isoDate, daysForward) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + daysForward);
  return d.toISOString().split('T')[0];
}

function getMockSubscriptions(riderId = null) {
  return [
    buildSubscription({ payment_status: 'PENDING' }),
    buildSubscription({ id: 51, payment_status: 'PAID' }),
  ];
}

function getMockDrivers(destination = null) {
  if (destination) {
    return mockDrivers.filter((d) => d.destination === destination || d.destination?.includes(destination));
  }
  return mockDrivers;
}

/**
 * Resolves a request to a mock response. Returns a promise that resolves after
 * a random delay to the axios response shape: { data, status, statusText, headers, config }.
 */
export function resolveMockRequest(config) {
  const url = (config.url || '').replace(config.baseURL || '', '').split('?')[0];
  const method = (config.method || 'get').toLowerCase();
  const params = config.params || {};
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};

  return randomDelay().then(() => {
    // Optional: subtle console hint that "backend" is being used (illusion)
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[Mock API]', method.toUpperCase(), url, params?.rider ? `rider=${params.rider}` : '');
    }

    let data = null;
    let status = 200;

    // Auth
    if (url.includes('login/') && method === 'post') {
      const username = (body.username || 'student1').toLowerCase();
      currentMockUser = mockUsers[username] || mockUsers.default;
      if (username.includes('driver')) currentMockUser = mockUsers.driver1;
      if (username.includes('parent')) currentMockUser = mockUsers.parent1;
      data = {
        status: 'success',
        data: {
          access: 'mock-access-' + Date.now(),
          refresh: 'mock-refresh-' + Date.now(),
          user: currentMockUser,
        },
        message: 'Login successful',
      };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('token/refresh') && method === 'post') {
      data = {
        status: 'success',
        data: { access: 'mock-access-refreshed-' + Date.now() },
        message: null,
      };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Users
    if (url.includes('users/me/')) {
      const user = currentMockUser || mockUsers.default;
      data = { status: 'success', data: user, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('users/link_passenger/') && method === 'post') {
      data = { status: 'success', data: { linked: true, passenger_id: 1 }, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/users\/\d+\//) && method === 'get') {
      const id = parseInt(url.match(/users\/(\d+)\//)[1], 10);
      const user = childUsers[id] || mockUsers.default;
      data = { status: 'success', data: user, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('users/') && method === 'post') {
      currentMockUser = {
        id: 99,
        username: body.username || 'newuser',
        first_name: body.first_name || 'مستخدم',
        last_name: body.last_name || 'جديد',
        role: body.role || 'PASSENGER',
        phone_number: body.phone_number || '',
        email: body.email || '',
      };
      data = { status: 'success', data: currentMockUser, message: 'User registered' };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Destinations
    if (url.includes('destinations/') && method === 'get') {
      data = { status: 'success', data: mockDestinations, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Drivers
    if (url.includes('drivers/') && method === 'get') {
      const hasId = url.match(/drivers\/(\d+)\//);
      if (hasId) {
        const id = parseInt(hasId[1], 10);
        const driver = mockDrivers.find((d) => d.id === id) || mockDrivers[0];
        data = { status: 'success', data: driver, message: null };
      } else {
        const riderParam = params.rider;
        const destinationParam = body.destination || params.destination;
        if (currentMockUser?.role === 'DRIVER') {
          data = { status: 'success', data: [mockDrivers[0]], message: null };
        } else {
          const list = getMockDrivers(destinationParam);
          data = { status: 'success', data: list, message: null };
        }
      }
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('drivers/') && method === 'post') {
      const newDriver = {
        id: 10,
        user: currentMockUser,
        vehicle_model: body.vehicle_model || 'تويوتا',
        license_plate: body.license_plate || 'بغداد ٠٠٠',
        status: 'PENDING',
        destination: body.destination || mockDestinations[0].name,
        zone: body.zone || 1,
        capacity: body.capacity || 4,
      };
      data = { status: 'success', data: newDriver, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Rides
    if (url.includes('rides/') && method === 'get') {
      const riderId = params.rider;
      const list = getMockRides(riderId);
      data = { status: 'success', data: list, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/rides\/\d+\/cancel\//) && method === 'post') {
      data = { status: 'success', data: { status: 'CANCELLED' }, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/rides\/\d+\//) && method === 'patch') {
      data = { status: 'success', data: { status: body.status || 'COMPLETED' }, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Subscriptions
    if (url.includes('subscriptions/') && method === 'get') {
      const riderId = params.rider;
      const list = getMockSubscriptions(riderId);
      data = { status: 'success', data: list, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('subscriptions/') && method === 'post' && !url.match(/\/\d+\//)) {
      const sub = buildSubscription({
        driver_id: body.driver_id,
        weekdays: body.weekdays || [0, 1, 2, 3, 4],
      });
      data = { status: 'success', data: sub, message: null };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/subscriptions\/\d+\/pay\//) && method === 'post') {
      data = { status: 'success', data: { payment_status: 'PAID' }, message: 'Payment successful.' };
      return { data, status, statusText: 'OK', headers: {}, config };
    }

    // Fallback
    data = { status: 'success', data: null, message: null };
    return { data, status, statusText: 'OK', headers: {}, config };
  });
}
