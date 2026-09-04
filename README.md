# FLUETAS — Your Body. Your Data. Your Formula.

FLUETAS is a next-generation clinical, wellness, and human performance health platform. It unifies personalized training, menstrual and hormonal health telemetry (FLUETAS HER), biometric logging, sovereign medical records, and 1-on-1 encrypted telehealth consultations with board-verified clinical specialists.

---

## 🚀 Key Platform Pillars

- **FLUETAS HER (Women's Health & Hormonal Telemetry):**
  Observation-backed cycle phases, ovulation estimation, symptom logging, and confidential consultations with Women's Health & Clinical Biochemistry specialists.
- **Verified Clinical & Expert Consultations:**
  Encrypted 1-on-1 telehealth booking, sovereign patient data consent scopes, collision-prevented scheduling, clinical examination notes, and diagnostic lab test requisitions.
- **Sovereign Health Records & Timeline:**
  Encrypted health telemetry, biometric logs, diagnostic lab report reviews, and HIPAA/telehealth-aligned patient privacy controls.
- **Dynamic Training & Physical Conditioning:**
  Custom periodized workout splits, interactive 3D exercise video guidance, volume and intensity progression tracking.
- **Metabolic & Personalized Nutrition:**
  Macro/micro nutrient breakdown, custom food cataloging, hydration tracking, and 3D nutritional showcase.

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS Design System
- **Database & Auth:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **3D & Visualizations:** Three.js / React Three Fiber, Lucide React
- **Testing:** Vitest

---

## 🔐 Multi-Role Architecture

The platform provides dedicated, security-bounded workspaces:
1. **Members / Patients (`/(app)/*`):** Personal dashboard, cycle tracker, workouts, nutrition, health records, and expert booking directory.
2. **Clinical Practitioners (`/(app)/doctor/*`):** Doctor workspace, authorized patient lists, clinical note authoring, diagnostic requests, and follow-up scheduling.
3. **Platform Governance (`/(app)/admin/*`):** Practitioner credential verification, regulatory compliance, platform analytics, and audit logging.

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- npm or yarn

### 2. Environment Configuration
Copy the environment template and populate with your Firebase credentials:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy Architecture

- **Sovereign Health Data:** Patient records and consultation logs are encrypted and strictly bound by patient-granted consent scopes.
- **Double-Booking Collision Prevention:** Server-validated appointment scheduling ensures conflict-free clinical time slots.
- **Role Isolation:** Enforced authorization checks prevent unauthorized cross-role access between patient and clinical areas.

---

© 2026 FLUETAS. All rights reserved.
