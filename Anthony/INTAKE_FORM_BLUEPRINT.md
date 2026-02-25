# Digital Intake Form Blueprint: Dr de Pontes

This document maps the 22-page paper/PDF intake form into a digital, multi-step architecture for the new portal.

## Design Strategy: "Progressive Disclosure"
To avoid "form fatigue" on a 22-page document, the digital version will use:
1.  **Multi-Step Navigation**: Users see their progress (e.g., Step 3 of 12).
2.  **Conditional Logic**: Sections like "Male/Female Specific History" only show based on prior answers.
3.  **Auto-Save**: Progress is saved to the portal database after every step so users can return later.

## Section Mapping

### Step 1: Personal Profile
*   Fields: Name, DOB, Contact Info, Race (Demographics), Emergency Contact.

### Step 2: Main Health Concerns
*   Dynamic Table: Users can "Add Concern" with severity and onset date.
*   Long-form: Chief complaint description.

### Step 3: Medical & Surgical History
*   Grouping: Checklist of conditions (e.g., Asthma, Diabetes) + Table for surgeries.

### Step 4: Medications & Supplements
*   Database-linked search for common medications.
*   Checkboxes for allergy history.

### Step 5: Family & Environmental History
*   Matrix of family conditions.
*   Childhood health questions.

### Step 6: Targeted Symptoms Review
*   Categorized Checkboxes: Skin, Eyes, GI, Dental, Sleep.

### Step 7: Stress & Psychosocial (SENSITIVE)
*   *Warning/Disclaimer*: Clear notice about sensitive questions.
*   Scale/Slider: Stress and happiness levels.
*   Text: History of major life events.

## Technical Implementation
*   **Form Logic**: React Hook Form with Zod validation.
*   **Database**: Supabase `patient_intake` table with JSONB for flexible symptom tracking.
*   **Output**: Automated PDF generation for Dr. Anthony's review during consultations.
