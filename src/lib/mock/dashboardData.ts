/**
 * Comprehensive Mock Data for FLUETAS Phase 1.5
 * All structures strictly adhere to the Firestore Data Model schema from §3.
 */

// ─── User & Basic Profile ──────────────────────────────────────────────────
export const mockUser = {
  id: 'user_yogesh_01',
  name: 'Yogesh Sharma',
  email: 'yogesh@example.com',
  dob: '1996-04-14',
  gender: 'Male',
  height: '178 cm',
  weight: '74.5 kg',
  bloodGroup: 'O+',
  emergencyContact: {
    name: 'Kavita Sharma',
    relationship: 'Spouse',
    phone: '+91 98765 43210',
  },
  role: 'customer',
  premiumMember: true,
  createdAt: '2026-01-10T10:00:00Z',
  avatar: null as string | null,
};

// ─── Health Profile (/users/{userId}/healthProfile/main) ───────────────────
export const mockHealthProfile = {
  allergies: ['Peanuts', 'Lactose (Mild)', 'Penicillin'],
  dietaryPreferences: ['High Protein', 'Flexitarian', 'No Refined Sugar'],
  lifestyleInfo: {
    activityLevel: 'Active (4-5 workouts/week)',
    occupation: 'Software Engineer',
    smokingStatus: 'Non-Smoker',
    alcoholConsumption: 'Occasional (1-2 drinks/week)',
    waterIntakeGoal: '2.5L / day',
    sleepGoal: '7.5 - 8.0 hours',
  },
  chronicConditions: ['None reported'],
  previousSurgeries: [
    { procedure: 'Arthroscopic Right Meniscus Repair', year: '2022', hospital: 'Apollo Ortho Center' }
  ],
  previousInjuries: [
    { injury: 'Grade 2 Left Ankle Sprain', year: '2024', status: 'Fully Rehabilitated' },
    { injury: 'Lower Back Strain (L4-L5)', year: '2025', status: 'Managed with Physio' }
  ],
  currentMedications: [
    { name: 'Vitamin D3 (60,000 IU)', dosage: 'Once weekly', prescribedBy: 'Dr. Priya Sharma' },
    { name: 'Omega-3 Fish Oil (1000mg)', dosage: 'Daily post dinner', prescribedBy: 'Self/Nutritionist' },
    { name: 'FLUETAS RECOVER+ Electrolytes', dosage: 'During/Post workout', prescribedBy: 'Daily Routine' }
  ],
  familyHistory: {
    maternal: 'Type 2 Diabetes (Late onset)',
    paternal: 'Hypertension',
  },
  womensHealthHistory: null,
};

// ─── Wellness Rings ────────────────────────────────────────────────────────
export const mockWellnessScores = [
  {
    id: 'recovery',
    label: 'Recovery',
    score: 78,
    max: 100,
    status: 'Good',
    subtext: 'Keep it up!',
    color: '#10B981',
    trackColor: '#064E3B',
    emoji: '🔋',
  },
  {
    id: 'hydration',
    label: 'Hydration',
    score: 64,
    max: 100,
    status: 'Needs Work',
    subtext: 'Drink more water',
    color: '#38BDF8',
    trackColor: '#0C4A6E',
    emoji: '💧',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    score: 81,
    max: 100,
    status: 'Good',
    subtext: '7h 12m',
    color: '#A78BFA',
    trackColor: '#3B0764',
    emoji: '🌙',
  },
  {
    id: 'training',
    label: 'Training',
    score: 72,
    max: 100,
    status: 'Good',
    subtext: 'On track',
    color: '#FB923C',
    trackColor: '#431407',
    emoji: '🏋️',
  },
  {
    id: 'wellness',
    label: 'Wellness Score',
    score: 76,
    max: 100,
    status: 'Good',
    subtext: "You're doing great!",
    color: '#F472B6',
    trackColor: '#500724',
    emoji: '❤️',
  },
];

// ─── Today's Focus ─────────────────────────────────────────────────────────
export const mockTodaysFocus = [
  { id: 'hydration', label: 'Hydration', detail: 'Drink 2.5L water (1.8L logged)', progress: 72, done: false, color: '#38BDF8', emoji: '💧' },
  { id: 'workout',   label: 'Workout',   detail: 'Upper Body Strength (Completed)', progress: 100, done: true,  color: '#10B981', emoji: '🏋️' },
  { id: 'nutrition', label: 'Nutrition', detail: '1,820 / 2,140 kcal (96g Protein)', progress: 85, done: false, color: '#22C55E', emoji: '🥗' },
  { id: 'sleep',     label: 'Sleep',     detail: '7h 12m logged (Quality 81%)', progress: 92, done: true, color: '#A78BFA', emoji: '🌙' },
];

// ─── Upcoming Appointments ─────────────────────────────────────────────────
export const mockAppointments = [
  {
    id: 'apt-1',
    doctorId: 'doc-anjali-mehta',
    doctorName: 'Dr. Anjali Mehta',
    specialization: 'Physiotherapist & Sports Rehab',
    dateLabel: 'Tomorrow',
    time: '11:00 AM',
    rating: 4.9,
    reviewsCount: 128,
    status: 'Confirmed',
    avatarInitials: 'AM',
    avatarColor: '#7C3AED',
    location: 'Video Consultation (Encrypted)',
  },
  {
    id: 'apt-2',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'Clinical Nutritionist & Dietitian',
    dateLabel: '26 Aug 2026',
    time: '04:00 PM',
    rating: 4.9,
    reviewsCount: 240,
    status: 'Confirmed',
    avatarInitials: 'PS',
    avatarColor: '#DB2777',
    location: 'Video Consultation (Encrypted)',
  },
];

// ─── Weekly Progress Chart ─────────────────────────────────────────────────
export const mockWeeklyProgress = [
  { day: 'Mon', workouts: 65,  calories: 1820, sleep: 7.5, water: 2.4 },
  { day: 'Tue', workouts: 45,  calories: 2100, sleep: 6.8, water: 2.1 },
  { day: 'Wed', workouts: 80,  calories: 1950, sleep: 8.0, water: 2.6 },
  { day: 'Thu', workouts: 35,  calories: 1750, sleep: 7.2, water: 2.0 },
  { day: 'Fri', workouts: 90,  calories: 2200, sleep: 6.5, water: 2.5 },
  { day: 'Sat', workouts: 50,  calories: 1900, sleep: 7.8, water: 2.8 },
  { day: 'Sun', workouts: 20,  calories: 1600, sleep: 8.5, water: 2.2 },
];

// ─── AI Coach Insights & Conversation ──────────────────────────────────────
export const mockAIInsight = {
  text: 'Your training volume has increased 18% this week. Consider prioritizing recovery electrolytes and an extra 20g protein post-workout.',
};

export const mockPastAIInsights = [
  {
    id: 'ai-ins-1',
    date: 'Today, 08:30 AM',
    category: 'Training & Recovery',
    badgeColor: '#10B981',
    text: 'Upper body intensity was high today (RPE 8.5). Optimal recovery window closes in 90 minutes. Hydrate with RECOVER+ electrolytes.',
  },
  {
    id: 'ai-ins-2',
    date: 'Yesterday, 10:00 PM',
    category: 'Sleep Optimization',
    badgeColor: '#A78BFA',
    text: 'Deep sleep was 24% of your total cycle last night. Maintain your 10:30 PM wind-down routine for consistent circadian alignment.',
  },
  {
    id: 'ai-ins-3',
    date: '24 Aug 2026',
    category: 'Nutrition Sync',
    badgeColor: '#F59E0B',
    text: 'Protein intake averaged 102g/day over the last 5 days. Target 120g on heavy lifting days to maximize myofibrillar synthesis.',
  },
  {
    id: 'ai-ins-4',
    date: '22 Aug 2026',
    category: 'Consultation Recommendation',
    badgeColor: '#38BDF8',
    text: 'Lower back stiffness logged for 3 consecutive days. Recommend consulting Dr. Anjali Mehta (Physio) for lumbar mobility drills.',
  },
];

export const mockAIChatMessages = [
  {
    id: 'm1',
    sender: 'bot',
    text: 'Hello Yogesh! I analyzed your recovery score (78/100) and workout logs today. How is your right shoulder and lower back feeling after the Upper Body session?',
    timestamp: '09:00 AM',
  },
  {
    id: 'm2',
    sender: 'user',
    text: 'Shoulder felt great! Slight tightness in traps after the overhead press sets.',
    timestamp: '09:02 AM',
  },
  {
    id: 'm3',
    sender: 'bot',
    text: "Got it. I suggest 3 minutes of lacrosse ball trap releases and light band pull-aparts. Also make sure to drink at least 700ml water before 1 PM. Would you like me to add a quick 5-minute cooldown routine to your workout log?",
    timestamp: '09:03 AM',
  },
];

// ─── Products & Explore (with Upcoming Treatment) ──────────────────────────
export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  subtext: string;
  color: string;
  bgColor: string;
  emoji: string;
  accentColor: string;
  isUpcoming: boolean;
  launchDate?: string;
  badge?: string;
  price?: string;
  rating?: number;
  inStock?: boolean;
}

export const mockProducts: ProductItem[] = [
  {
    id: 'recover',
    name: 'RECOVER+',
    tagline: 'Hydration & Recovery Support',
    subtext: 'Replenish electrolytes. Rehydrate cells. Recover faster.',
    color: '#10B981',
    bgColor: '#052e16',
    emoji: '🌿',
    accentColor: '#34D399',
    isUpcoming: false,
    price: '₹1,499',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 'athlete',
    name: 'ATHLETE+',
    tagline: 'Train Smarter, Perform Better.',
    subtext: 'Fuel your training. Power muscle stamina and strength.',
    color: '#F59E0B',
    bgColor: '#1c1400',
    emoji: '⚡',
    accentColor: '#FBBF24',
    isUpcoming: false,
    price: '₹1,899',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 'gut',
    name: 'GUT+',
    tagline: 'Everyday Digestive Wellness',
    subtext: '10 Strain Synbiotics. Happy microbiome, stronger immunity.',
    color: '#F97316',
    bgColor: '#1c0a00',
    emoji: '🌱',
    accentColor: '#FB923C',
    isUpcoming: false,
    price: '₹1,299',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 'glow',
    name: 'GLOW+',
    tagline: 'Nutrition for Your Glow',
    subtext: 'Marine collagen peptides + astaxanthin. Nourish from within.',
    color: '#A78BFA',
    bgColor: '#1e0a3c',
    emoji: '✨',
    accentColor: '#C4B5FD',
    isUpcoming: false,
    price: '₹2,199',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 'her',
    name: 'HER+',
    tagline: "Women's Cycle & Hormonal Harmony",
    subtext: 'Myo-inositol, Shatavari & Chasteberry. Empower your cycle.',
    color: '#F472B6',
    bgColor: '#2d0a1a',
    emoji: '♀️',
    accentColor: '#F9A8D4',
    isUpcoming: false,
    price: '₹1,699',
    rating: 4.8,
    inStock: true,
  },
  // Upcoming Products (§2 requirement)
  {
    id: 'focus',
    name: 'FOCUS+',
    tagline: 'Nootropic Cognitive & Flow State',
    subtext: 'Lion\'s Mane, Alpha-GPC & L-Theanine. Sustained mental clarity without jitters.',
    color: '#38BDF8',
    bgColor: '#082f49',
    emoji: '🧠',
    accentColor: '#7dd3fc',
    isUpcoming: true,
    launchDate: 'Launching October 2026',
    badge: 'Upcoming',
    price: '₹1,799',
  },
  {
    id: 'shield',
    name: 'SHIELD+',
    tagline: 'Cellular Longevity & Antioxidants',
    subtext: 'Liposomal Glutathione, CoQ10 & Trans-Resveratrol for cellular defense.',
    color: '#EAB308',
    bgColor: '#262208',
    emoji: '🛡️',
    accentColor: '#fde047',
    isUpcoming: true,
    launchDate: 'Launching November 2026',
    badge: 'Upcoming',
    price: '₹2,499',
  },
];

// ─── Dashboard Today's Workout & Nutrition & Activity ──────────────────────
export const mockTodaysWorkout = {
  name: 'Upper Body Strength',
  focus: 'Muscle Focus',
  exercises: 6,
  duration: '45–60 min',
  level: 'Intermediate',
};

export const mockCycleData = {
  currentDay: 12,
  phase: 'Follicular Phase',
  daysToOvulation: 6,
  weekDays: [8, 9, 10, 11, 12, 13, 14],
  logs: [
    { emoji: '🩸', label: 'Flow' },
    { emoji: '😖', label: 'Cramps' },
    { emoji: '😊', label: 'Mood' },
    { emoji: '⚡', label: 'Energy' },
    { emoji: '😴', label: 'Sleep' },
    { emoji: '🫧', label: 'Bloating' },
  ],
};

export const mockNutrition = {
  calories: 1820,
  caloriesTarget: 2140,
  macros: [
    { name: 'Protein', current: 96,  target: 120, color: '#3B82F6', unit: 'g' },
    { name: 'Carbs',   current: 210, target: 280, color: '#22C55E', unit: 'g' },
    { name: 'Fats',    current: 56,  target: 80,  color: '#F59E0B', unit: 'g' },
  ],
};

export const mockRecentActivity = [
  { id: 'a1', type: 'workout',   title: 'Workout Completed', detail: 'Upper Body Strength', time: 'Today, 08:15 AM', emoji: '🏋️' },
  { id: 'a2', type: 'hydration', title: 'Water Intake',      detail: '1.8 / 2.5L',          time: 'Today, 07:41 AM', emoji: '💧' },
  { id: 'a3', type: 'nutrition', title: 'Meal Added',        detail: 'Post Workout Meal',    time: 'Today, 01:20 PM', emoji: '🥗' },
  { id: 'a4', type: 'sleep',     title: 'Sleep Logged',      detail: '7h 12m',               time: 'Yesterday, 11:30 PM', emoji: '🌙' },
];

// ─── Orders Data ──────────────────────────────────────────────────────────
export const mockOrders = [
  {
    id: 'ORD-98241',
    date: '20 Aug 2026',
    status: 'Delivered',
    statusColor: '#10B981',
    total: '₹2,998',
    items: [
      { name: 'FLUETAS RECOVER+ (Electrolyte Lemonade)', qty: 1, price: '₹1,499' },
      { name: 'FLUETAS GUT+ Synbiotic (60 Caps)', qty: 1, price: '₹1,299' },
    ],
    trackingId: 'DTDC-8849102941',
    deliveryDate: '23 Aug 2026',
  },
  {
    id: 'ORD-97103',
    date: '02 Aug 2026',
    status: 'Delivered',
    statusColor: '#10B981',
    total: '₹1,899',
    items: [
      { name: 'FLUETAS ATHLETE+ Pre-Workout Fuel', qty: 1, price: '₹1,899' },
    ],
    trackingId: 'BLUEDART-993021',
    deliveryDate: '05 Aug 2026',
  },
];

// ─── Detailed Training & Workouts ──────────────────────────────────────────
export const mockTrainingSplit = [
  { day: 'Mon', focus: 'Upper Body Power', status: 'Completed', duration: '55 min', rpe: '8/10', exercisesCount: 6 },
  { day: 'Tue', focus: 'Lower Body Strength', status: 'Completed', duration: '60 min', rpe: '8.5/10', exercisesCount: 7 },
  { day: 'Wed', focus: 'Zone 2 Cardio + Core', status: 'Completed', duration: '40 min', rpe: '6/10', exercisesCount: 4 },
  { day: 'Thu', focus: 'Push Hypertrophy', status: 'Completed', duration: '50 min', rpe: '8/10', exercisesCount: 6 },
  { day: 'Fri', focus: 'Pull & Lumbar Rehab', status: 'Today', duration: '45-60 min', rpe: 'Planned', exercisesCount: 6, active: true },
  { day: 'Sat', focus: 'Legs & Mobility Flow', status: 'Scheduled', duration: '50 min', rpe: 'Upcoming', exercisesCount: 5 },
  { day: 'Sun', focus: 'Active Recovery & Walk', status: 'Scheduled', duration: '30 min', rpe: 'Rest', exercisesCount: 3 },
];

export const mockWorkoutExercises = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest / Triceps',
    sets: [
      { set: 1, reps: '10', weight: '60 kg', done: true },
      { set: 2, reps: '8', weight: '70 kg', done: true },
      { set: 3, reps: '6', weight: '75 kg', done: true },
      { set: 4, reps: '6', weight: '75 kg', done: false },
    ],
    notes: 'Keep elbows tucked at 45 degrees. Controlled eccentric.',
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Chest Press',
    targetMuscle: 'Upper Pectorals',
    sets: [
      { set: 1, reps: '12', weight: '24 kg', done: true },
      { set: 2, reps: '10', weight: '26 kg', done: false },
      { set: 3, reps: '10', weight: '26 kg', done: false },
    ],
    notes: 'Squeeze chest at top contraction.',
  },
  {
    id: 'ex-3',
    name: 'Weighted Neutral Pull-Ups',
    targetMuscle: 'Lats & Rhomboids',
    sets: [
      { set: 1, reps: '8', weight: '+10 kg', done: true },
      { set: 2, reps: '8', weight: '+10 kg', done: false },
      { set: 3, reps: '6', weight: '+10 kg', done: false },
    ],
    notes: 'Full range of motion, avoid swinging.',
  },
  {
    id: 'ex-4',
    name: 'Cable Face Pulls & Rotator Cuff',
    targetMuscle: 'Rear Delts / Rotator Cuff',
    sets: [
      { set: 1, reps: '15', weight: '18 kg', done: false },
      { set: 2, reps: '15', weight: '18 kg', done: false },
      { set: 3, reps: '15', weight: '18 kg', done: false },
    ],
    notes: 'Physio prescribed for shoulder stabilization.',
  },
];

export const mockWorkoutHistory = [
  {
    id: 'w-log-01',
    date: 'Today, 08:15 AM',
    title: 'Upper Body Power & Hypertrophy',
    type: 'Strength',
    duration: '54 min',
    calories: 420,
    volume: '7,450 kg',
    status: 'Completed',
    exercises: 6,
  },
  {
    id: 'w-log-02',
    date: '26 Aug 2026',
    title: 'Lower Body Quad & Posterior Chain',
    type: 'Strength',
    duration: '62 min',
    calories: 510,
    volume: '9,200 kg',
    status: 'Completed',
    exercises: 7,
  },
  {
    id: 'w-log-03',
    date: '25 Aug 2026',
    title: 'Zone 2 Incline Treadmill & Mobility',
    type: 'Cardio & Recovery',
    duration: '42 min',
    calories: 310,
    volume: '-',
    status: 'Completed',
    exercises: 4,
  },
  {
    id: 'w-log-04',
    date: '23 Aug 2026',
    title: 'Functional Push & Core Stabilization',
    type: 'Functional',
    duration: '48 min',
    calories: 390,
    volume: '6,100 kg',
    status: 'Completed',
    exercises: 6,
  },
];

// ─── Detailed Nutrition Data ───────────────────────────────────────────────
export const mockMealTimeline = [
  {
    id: 'meal-1',
    mealType: 'Breakfast',
    time: '08:45 AM',
    calories: 520,
    items: ['3 Whole Eggs + 2 Whites Omelette', '2 Slices Multigrain Sourdough', '1/2 Avocado', 'Black Coffee'],
    macros: { p: 32, c: 42, f: 22 },
  },
  {
    id: 'meal-2',
    mealType: 'Mid-Morning Snack',
    time: '11:30 AM',
    calories: 280,
    items: ['Greek Yogurt (200g)', 'Handful of Blueberries & Chia Seeds', '10 Almonds'],
    macros: { p: 20, c: 22, f: 10 },
  },
  {
    id: 'meal-3',
    mealType: 'Lunch',
    time: '01:30 PM',
    calories: 640,
    items: ['Grilled Chicken Breast / Paneer (180g)', 'Brown Rice (1 cup)', 'Sauteed Broccoli, Zucchini & Bell Peppers', 'Olive oil dressing'],
    macros: { p: 44, c: 68, f: 18 },
  },
  {
    id: 'meal-4',
    mealType: 'Post-Workout Fuel',
    time: '06:00 PM',
    calories: 380,
    items: ['Whey Isolate Shake', '1 Banana', 'FLUETAS RECOVER+ Electrolytes'],
    macros: { p: 28, c: 54, f: 4 },
  },
];

// ─── Detailed Hydration Data ───────────────────────────────────────────────
export const mockHydrationLogs = [
  { time: '07:30 AM', amount: 350, type: 'Warm Water + Lemon' },
  { time: '09:00 AM', amount: 400, type: 'Pure Filtered Water' },
  { time: '11:15 AM', amount: 300, type: 'Green Tea' },
  { time: '01:45 PM', amount: 400, type: 'Water with lunch' },
  { time: '04:30 PM', amount: 350, type: 'FLUETAS RECOVER+ Hydration Mix' },
];

export const mockHydrationWeek = [
  { day: 'Mon', intake: 2.4, target: 2.5 },
  { day: 'Tue', intake: 2.1, target: 2.5 },
  { day: 'Wed', intake: 2.6, target: 2.5 },
  { day: 'Thu', intake: 2.0, target: 2.5 },
  { day: 'Fri', intake: 2.5, target: 2.5 },
  { day: 'Sat', intake: 2.8, target: 2.5 },
  { day: 'Sun', intake: 2.3, target: 2.5 },
];

// ─── Detailed Sleep Data ───────────────────────────────────────────────────
export const mockSleepSummary = {
  score: 81,
  duration: '7h 12m',
  target: '8h 00m',
  efficiency: '92%',
  asleepTime: '11:18 PM',
  wakeTime: '06:30 AM',
  stages: {
    deep: { time: '1h 44m', pct: 24, optimal: true },
    rem: { time: '1h 56m', pct: 27, optimal: true },
    light: { time: '3h 22m', pct: 47, optimal: false },
    awake: { time: '10m', pct: 2, optimal: true },
  },
  hrvAverage: '58 ms',
  restingHR: '54 bpm',
  respiratoryRate: '14.2 brpm',
};

export const mockSleepWeek = [
  { day: 'Mon', duration: 7.5, score: 84 },
  { day: 'Tue', duration: 6.8, score: 74 },
  { day: 'Wed', duration: 8.0, score: 88 },
  { day: 'Thu', duration: 7.2, score: 79 },
  { day: 'Fri', duration: 6.5, score: 72 },
  { day: 'Sat', duration: 7.8, score: 85 },
  { day: 'Sun', duration: 8.5, score: 91 },
];

// ─── Detailed Symptoms Data ────────────────────────────────────────────────
export const mockSymptomLogs = [
  {
    id: 'sym-1',
    date: 'Today, 09:30 AM',
    symptom: 'Upper Trapezius Tightness',
    category: 'Musculoskeletal',
    severity: 'Mild',
    severityColor: '#10B981',
    notes: 'Triggered post heavy military press. Relieved with stretching.',
  },
  {
    id: 'sym-2',
    date: '25 Aug 2026',
    symptom: 'Post-Meal Bloating',
    category: 'Digestive',
    severity: 'Moderate',
    severityColor: '#F59E0B',
    notes: 'After dairy dessert. Confirms lactose sensitivity.',
  },
  {
    id: 'sym-3',
    date: '22 Aug 2026',
    symptom: 'Lower Back Dull Ache',
    category: 'Musculoskeletal',
    severity: 'Moderate',
    severityColor: '#F59E0B',
    notes: 'After prolonged sitting at desk (6+ hrs). Physio appointment scheduled.',
  },
  {
    id: 'sym-4',
    date: '18 Aug 2026',
    symptom: 'Afternoon Brain Fog',
    category: 'Energy & Focus',
    severity: 'Mild',
    severityColor: '#10B981',
    notes: 'Resolved after 500ml hydration and 10min walk.',
  },
];

export const mockSymptomFrequencies = [
  { symptom: 'Muscle Tightness', count: 6, color: '#10B981' },
  { symptom: 'Bloating', count: 4, color: '#F97316' },
  { symptom: 'Back Ache', count: 3, color: '#FB923C' },
  { symptom: 'Brain Fog', count: 2, color: '#A78BFA' },
  { symptom: 'Fatigue', count: 1, color: '#38BDF8' },
];

// ─── Doctors Directory ─────────────────────────────────────────────────────
export const mockDoctorsList = [
  {
    id: 'doc-anjali-mehta',
    name: 'Dr. Anjali Mehta',
    specialization: 'Physiotherapist & Sports Rehab Specialist',
    credentials: 'MPT (Sports Medicine), Certified Dry Needling',
    experience: '9+ years experience',
    hospital: 'Fortis Healthcare & Sports Excellence Institute',
    rating: 4.9,
    reviews: 128,
    fee: '₹1,200 / session',
    nextSlot: 'Tomorrow, 11:00 AM',
    avatarInitials: 'AM',
    avatarColor: '#7C3AED',
    languages: 'English, Hindi',
    bio: 'Specialist in athletic rehabilitation, spinal biomechanics, postural realignment and return-to-sport protocols.',
  },
  {
    id: 'doc-priya-sharma',
    name: 'Dr. Priya Sharma',
    specialization: 'Clinical Nutritionist & Metabolic Health',
    credentials: 'M.Sc Clinical Nutrition, Certified Diabetes Educator',
    experience: '11+ years experience',
    hospital: 'Max Healthcare & Functional Wellness Clinic',
    rating: 4.9,
    reviews: 240,
    fee: '₹1,500 / session',
    nextSlot: '26 Aug 2026, 04:00 PM',
    avatarInitials: 'PS',
    avatarColor: '#DB2777',
    languages: 'English, Hindi, Punjabi',
    bio: 'Expert in gut-brain axis, sports fueling strategies, insulin sensitivity optimization, and sustainable body recomposition.',
  },
  {
    id: 'doc-rajesh-nair',
    name: 'Dr. Rajesh Nair',
    specialization: 'Sports Medicine Physician & Orthopedic Consult',
    credentials: 'MBBS, MS (Ortho), Fellowship in Sports Medicine',
    experience: '14+ years experience',
    hospital: 'Apollo Hospitals Orthopedic Center',
    rating: 4.8,
    reviews: 310,
    fee: '₹1,800 / session',
    nextSlot: '28 Aug 2026, 02:30 PM',
    avatarInitials: 'RN',
    avatarColor: '#2563EB',
    languages: 'English, Hindi, Malayalam',
    bio: 'Specializes in non-surgical injury management, joint preservation, PRP therapies, and comprehensive musculoskeletal diagnostic imaging review.',
  },
  {
    id: 'doc-sunita-rao',
    name: 'Dr. Sunita Rao',
    specialization: 'Gynecologist & Women\'s Endocrine Health',
    credentials: 'MBBS, MD (OB-GYN), Menopause Society Specialist',
    experience: '15+ years experience',
    hospital: 'Manipal Hospital & Center for Hormonal Health',
    rating: 4.9,
    reviews: 195,
    fee: '₹1,600 / session',
    nextSlot: '29 Aug 2026, 10:00 AM',
    avatarInitials: 'SR',
    avatarColor: '#EC4899',
    languages: 'English, Hindi, Kannada',
    bio: 'Expertise in PCOS/PCOD management, cycle sync nutrition, fertility wellness, and perimenopause hormonal transitions.',
  },
];

// ─── Consultations & Detailed History ──────────────────────────────────────
export const mockConsultationsList = [
  {
    id: 'cons-01',
    doctorId: 'doc-anjali-mehta',
    doctorName: 'Dr. Anjali Mehta',
    specialization: 'Physiotherapist',
    dateTime: 'Tomorrow, 11:00 AM',
    status: 'Upcoming',
    reasonForConsultation: 'Lumbar spine assessment and rotator cuff stabilization protocol review.',
    symptomsReported: ['Lower Back Tightness (L4-L5)', 'Upper Trap Stiffness'],
    hasConsentGranted: true,
  },
  {
    id: 'cons-02',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'Clinical Nutritionist',
    dateTime: '26 Aug 2026, 04:00 PM',
    status: 'Upcoming',
    reasonForConsultation: 'Review of complete blood count, Vitamin D3 & gut microbiome synbiotics response.',
    symptomsReported: ['Lactose Sensitivity', 'Afternoon energy drop'],
    hasConsentGranted: true,
  },
  {
    id: 'cons-03',
    doctorId: 'doc-rajesh-nair',
    doctorName: 'Dr. Rajesh Nair',
    specialization: 'Sports Medicine Physician',
    dateTime: '15 Jul 2026, 03:00 PM',
    status: 'Completed',
    reasonForConsultation: 'Post-meniscus repair 2-year athletic clearance and biomechanics check.',
    symptomsReported: ['Right Knee Mild Crepitus during deep squats'],
    clinicalNotes: 'Knee joint stability is intact (Lachman negative, McMurray negative). Bilateral quad symmetry is 94%. Mild patellofemoral tracking friction noted during >100° flexion.',
    assessment: 'Meniscus repair intact with excellent healing. Mild VMO (vastus medialis oblique) weakness causing minor tracking friction.',
    advice: 'Incorporate terminal knee extensions (TKEs) with resistance bands, hamstring curls, and single-leg Bulgarian split squats. Continue low-impact recovery on rest days.',
    suggestedTests: ['Complete Blood Panel (Lipid, D3, B12)', 'hs-CRP (Inflammation marker)'],
    reportUrl: '/reports/CONS-03-SUMMARY.pdf',
    hasConsentGranted: true,
  },
];

// ─── Documents & Lab Reports (/users/{userId}/documents/{docId}) ──────────
export const mockDocumentsList = [
  {
    id: 'doc-rep-01',
    documentType: 'report',
    reportName: 'Comprehensive Metabolic & Vitamin Panel',
    dateOfReport: '18 Jul 2026',
    uploadedBy: 'Thyrocare Labs / Yogesh Sharma',
    fileSize: '2.4 MB',
    status: 'Completed',
    statusStep: 5, // 1: Requested, 2: Uploaded, 3: Reviewed, 4: Commented, 5: Completed
    relatedConsultationId: 'cons-03',
    doctorReview: {
      reviewedBy: 'Dr. Priya Sharma',
      reviewedDate: '19 Jul 2026',
      findings: 'Vitamin D3 is at 28 ng/mL (sub-optimal). HbA1c is optimal at 5.2%. Serum Ferritin is robust at 145 ng/mL.',
      recommendation: 'Initiate 60,000 IU Vitamin D3 cholecalciferol for 8 weeks with healthy fats breakfast.',
      followupRequired: true,
      notes: 'All kidney and liver function markers are in pristine range.',
    },
    testParameters: [
      { test: 'Vitamin D3 (25-OH)', value: '28.4 ng/mL', refRange: '30.0 - 100.0', status: 'Low', color: '#F59E0B' },
      { test: 'HbA1c (Glycated Hb)', value: '5.2 %', refRange: '< 5.7', status: 'Optimal', color: '#10B981' },
      { test: 'Vitamin B12', value: '480 pg/mL', refRange: '200 - 900', status: 'Optimal', color: '#10B981' },
      { test: 'Serum Ferritin', value: '145 ng/mL', refRange: '30 - 400', status: 'Optimal', color: '#10B981' },
      { test: 'hs-CRP (Cardio)', value: '0.8 mg/L', refRange: '< 1.0', status: 'Optimal', color: '#10B981' },
    ],
  },
  {
    id: 'doc-rep-02',
    documentType: 'scan',
    reportName: 'Right Knee Diagnostic MRI 3T',
    dateOfReport: '12 Jul 2026',
    uploadedBy: 'Mahajan Imaging Center',
    fileSize: '18.2 MB',
    status: 'Reviewed',
    statusStep: 3,
    relatedConsultationId: 'cons-03',
    doctorReview: {
      reviewedBy: 'Dr. Rajesh Nair',
      reviewedDate: '15 Jul 2026',
      findings: 'Prior posterior horn medial meniscus repair well integrated. No recurrent tear or joint effusion.',
      recommendation: 'Cleared for high-intensity lifting and linear sprinting.',
      followupRequired: false,
      notes: 'Excellent surgical outcome.',
    },
  },
  {
    id: 'doc-rep-03',
    documentType: 'prescription',
    reportName: 'Physiotherapy Exercise & Rehab Protocol Rx',
    dateOfReport: '15 Jul 2026',
    uploadedBy: 'Dr. Anjali Mehta',
    fileSize: '1.1 MB',
    status: 'Completed',
    statusStep: 5,
    relatedConsultationId: 'cons-03',
    doctorReview: {
      reviewedBy: 'Dr. Anjali Mehta',
      reviewedDate: '15 Jul 2026',
      findings: 'Phase 4 Return-to-Sport Biomechanics Prescription.',
      recommendation: 'Adhere to 3x weekly eccentric loading split.',
      followupRequired: true,
      notes: 'Next progress review scheduled for tomorrow.',
    },
  },
];

// ─── Active Consents (/users/{userId}/consents/{consentId}) ────────────────
export const mockConsentsList = [
  {
    id: 'consent-anjali-01',
    consultationId: 'cons-01',
    doctorId: 'doc-anjali-mehta',
    doctorName: 'Dr. Anjali Mehta',
    specialization: 'Physiotherapy',
    grantedScopes: {
      healthHistory: true,
      previousConsultations: true,
      relevantReports: true,
      currentMedications: true,
      workoutHistory: true,
      nutritionLogs: false,
    },
    grantedAt: '2026-08-25T14:30:00Z',
    expiresAt: '2026-09-25T14:30:00Z',
    status: 'Active',
  },
  {
    id: 'consent-priya-01',
    consultationId: 'cons-02',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'Clinical Nutrition',
    grantedScopes: {
      healthHistory: true,
      previousConsultations: true,
      relevantReports: true,
      currentMedications: true,
      workoutHistory: true,
      nutritionLogs: true,
    },
    grantedAt: '2026-08-24T18:00:00Z',
    expiresAt: '2026-09-24T18:00:00Z',
    status: 'Active',
  },
];

// ─── Achievements & Streaks ────────────────────────────────────────────────
export const mockAchievements = {
  level: 7,
  levelTitle: 'Metabolic & Athletic Optimizer',
  currentXp: 740,
  nextLevelXp: 1000,
  streaks: [
    { title: 'Workout Streak', days: 14, icon: '🔥', color: '#10B981', subtext: 'Personal Best: 21 Days' },
    { title: 'Hydration Target', days: 21, icon: '💧', color: '#38BDF8', subtext: 'Target 2.5L Achieved' },
    { title: 'Sleep Consistency', days: 8, icon: '🌙', color: '#A78BFA', subtext: '>7h every night' },
  ],
  badges: [
    { id: 'b1', name: 'Centurion Lifter', desc: 'Log 100 total resistance workouts', icon: '🏋️', earned: true, date: 'Aug 2026', color: '#10B981' },
    { id: 'b2', name: 'Hydration Master', desc: 'Hit 2.5L water goal for 21 consecutive days', icon: '🌊', earned: true, date: 'Aug 2026', color: '#38BDF8' },
    { id: 'b3', name: 'Sleep Maestro', desc: 'Achieve >85% sleep score for 7 consecutive days', icon: '👑', earned: true, date: 'Jul 2026', color: '#A78BFA' },
    { id: 'b4', name: 'Superfruit Pioneer', desc: 'Integrate 3 FLUETAS formulas into routine', icon: '🍇', earned: true, date: 'Jul 2026', color: '#F59E0B' },
    { id: 'b5', name: 'Iron Discipline', desc: 'Complete 30 days without missing a single log', icon: '🛡️', earned: false, progress: '24/30 Days', color: '#3A3F58' },
    { id: 'b6', name: 'Clinical Optimizer', desc: 'Complete 5 expert consultations with full follow-up', icon: '🩺', earned: false, progress: '2/5 Consults', color: '#3A3F58' },
  ],
};

// ─── Quick Actions ────────────────────────────────────────────────────────
export const mockQuickActions = [
  { id: 'log-workout',   label: 'Log Workout',    emoji: '🏋️', href: '/workouts' },
  { id: 'log-water',     label: 'Log Water',      emoji: '💧', href: '/hydration' },
  { id: 'log-meal',      label: 'Log Meal',       emoji: '🥗', href: '/nutrition' },
  { id: 'track-sleep',   label: 'Track Sleep',    emoji: '🌙', href: '/sleep' },
  { id: 'scan-qr',       label: 'Scan QR',        emoji: '📱', href: '/scan-qr' },
  { id: 'upload-report', label: 'Upload Report',  emoji: '📄', href: '/reports' },
  { id: 'talk-ai',       label: 'Talk to AI',     emoji: '🤖', href: '/ai-coach' },
  { id: 'book-expert',   label: 'Book Expert',    emoji: '👨‍⚕️', href: '/experts' },
];
