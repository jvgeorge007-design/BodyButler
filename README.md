# 🏔️ PeakU – AI-Powered Fitness & Nutrition Coach

## 🚀 Overview  
PeakU is an AI-driven fitness and nutrition app that simplifies tracking and delivers personalized coaching to help users achieve sustainable physique transformations. By addressing fragmented tracking and generic plans, PeakU offers seamless logging (voice, vision, barcode) and a unified Peak Score for diet, training, and recovery.

## 🌍 Mission  
Empower users to achieve fitness goals through low-friction, adaptive AI coaching that supports sustainable, meaningful lifestyle changes.

## 🧠 User Research & Problem  
Through competitor teardowns (Cal.ai, Fitbod, Lifesum) and Jobs-to-be-Done analysis, I identified key user pain points: clunky logging and lack of tailored guidance. I defined three personas—Simplifier, Planner, Reviewer—to prioritize low-friction tracking and dynamic coaching.

## ✨ Core Differentiators  
- **Peak Score Framework**  
  Unified score across Trail Fuel (diet), Climb (training), and Basecamp (recovery), dynamically weighted by user goal:  
  - **Cut**: 50/30/20 (emphasizing diet)  
  - **Recomp**: 40/40/20  
  - **Bulk**: 30/50/20  
  Sub-levers include:  
  - Protein intake  
  - Calorie window adherence  
  - NEAT (step count)  
  - Sleep duration/quality  
  - Workout completion & progression  
  Anti-cheat logic included for under-logging or unbalanced compliance.

- **Hybrid Logging Pipeline**  
  Combines OpenAI Vision + NutriFusionNet to estimate macros from food photos with:  
  - Contextual filtering using object detection  
  - Optional virtual pantry integration  
  - Fallback support for unknown items or unclear images  
  - Barcode and receipt parsing included for fast food/grocery intake  
  - Fully voice-enabled logging  

- **Proactive Coaching**  
  Daily nudges, recaps, and plan tuning based on body comp change and adherence — tone-tailored to user personality archetype.

- **Summit Metaphor & Mascot (Alto the GOAT)**  
  Users "climb" toward their physique summit, guided by a friendly mountain goat mascot for emotional engagement and gamified retention.

---

## 🧱 System Architecture (Snapshot)

- **Frontend**: React + Wouter + Tailwind + Shadcn/UI  
- **Backend**: Node.js + Express + Drizzle ORM  
- **Database**: Supabase (PostgreSQL) with modular JSON schema  
- **AI/ML Stack**:  
  - OpenAI Vision for object detection + context  
  - NutriFusionNet for nutrition inference  
  - GPT-4 for coaching, recaps, and plan adaptation  
  - USDA/FatSecret APIs for ingredient-level lookup  
- **Agentic Layers**:  
  - **Insight Engine** – daily/weekly coaching recaps  
  - **Goal Adaptation Layer** – dynamic macro + workout planning  
  - **Memory Layer** – contextual tone, preferences, and feedback  

---

## 🧪 MVP Features (Phase 1)

- Vision-based body fat estimation at onboarding + check-ins  
- Macro + workout plan generation based on user goals  
- Hybrid food logging (photo, receipt, barcode, voice)  
- Peak Score dashboard for diet, training, and recovery  
- Daily recap engine with micro-coaching nudges  

---

## 🔁 Roadmap & Iteration

- **MVP (Current)**:  
  Onboarding → Core logging → Peak Score dashboard → Daily recaps  
- **Iteration Work**:  
  - Ran onboarding UX friction tests  
  - Refined voice/photo logging speed  
  - Prototyped Alto mascot + streak retention mechanics  
- **Next Iteration**:  
  - Weekly summaries  
  - Deeper personalization through agent memory  
  - Proactive nudges for behavior shaping (20–30% engagement lift)  
- **Future Vision**:  
  - Wearables integration  
  - Gamified “Summit Challenge” with milestone tiers  
  - Macro correction based on sleep, soreness, and mood logs  

---

## 📊 Success Metrics

- Monthly retention ≥ **60%**  
- Macro adherence ≥ **70%**  
- ≥ **3 daily interactions/user**  
- ≥ **70% weekly check-in completion**  

---

## ⚙️ Tech Stack

- Replit + Supabase for backend & caching  
- USDA + FatSecret APIs for food metadata  
- OpenAI Vision + NutriFusionNet for hybrid macro estimation  
- React + Tailwind + Shadcn for front-end UI  
- Drizzle ORM + Supabase (PostgreSQL) for structured user and nutrition data  

---

## 🖼️ Screenshots / Mockups


| <img width="127" height="269" alt="image" src="https://github.com/user-attachments/assets/79a24dd8-dc0c-49b0-b615-53f33244eece" />
 | <img width="122" height="283" alt="image" src="https://github.com/user-attachments/assets/a69e8776-78b4-485d-9367-b7f64aee6a61" />
 <img width="125" height="281" alt="image" src="https://github.com/user-attachments/assets/71b652b6-33e0-4a3e-ad28-19810c8f22b4" />
 | <img width="128" height="282" alt="image" src="https://github.com/user-attachments/assets/1e33913a-09cc-4285-ab91-8cc78e89b121" />


---

## 🚀 Next Steps

- Pilot feedback: Validate macro logging accuracy (photo + barcode), coaching tone, and scoring friction  
- Build pantry-enhanced logging fallback + “Quick Add” flow  
- Expand daily/weekly recaps based on GPT memory & history  
