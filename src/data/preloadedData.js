// Preloaded INC Standardized B.Sc. Nursing OSCE Data Repository
// Aligned with Indian Nursing Council (INC) Competency Curriculum, WHO, & Mission Niramaya

export const PRELOADED_SUBJECTS = [
  {
    id: 'NF',
    code: 'N-NF-101',
    name: 'Nursing Foundation (I & II)',
    semesters: ['Semester I', 'Semester II'],
    color: '#71717a'
  },
  {
    id: 'AHN',
    code: 'N-AHN-201',
    name: 'Adult Health Nursing (MSN I & II)',
    semesters: ['Semester III', 'Semester IV'],
    color: '#71717a'
  },
  {
    id: 'PED',
    code: 'N-CHN-301',
    name: 'Child Health Nursing (Pediatrics)',
    semesters: ['Semester V', 'Semester VI'],
    color: '#71717a'
  },
  {
    id: 'MHN',
    code: 'N-MHN-302',
    name: 'Mental Health Nursing (Psychiatry)',
    semesters: ['Semester V', 'Semester VI'],
    color: '#71717a'
  },
  {
    id: 'CHN',
    code: 'N-COM-401',
    name: 'Community Health Nursing (I & II)',
    semesters: ['Semester V', 'Semester VII'],
    color: '#71717a'
  },
  {
    id: 'OBG',
    code: 'N-MID-402',
    name: 'Midwifery & Obstetrical Nursing (OBG)',
    semesters: ['Semester VI', 'Semester VII'],
    color: '#71717a'
  }
];

export const PRELOADED_PROCEDURES = [
  {
    id: 'PROC-NF-01',
    subjectId: 'NF',
    name: 'Vital Signs Assessment (TPR & BP)',
    semester: 'Semester II',
    defaultDurationSeconds: 300,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Failing to identify patient or using thumb to palpate radial pulse',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Verified patient identity using 2 identifiers, explained procedure, and rested patient for 5 minutes', marks: 2 },
      { id: 2, phase: 'Preparation', text: 'Performed WHO 6-step hand hygiene; disinfected thermometer probe and stethoscope diaphragm', marks: 1 },
      { id: 3, phase: 'Execution', text: 'Assessed axilla, placed probe in central axilla, kept arm snug across chest until digital beep', marks: 2 },
      { id: 4, phase: 'Execution', text: 'Read temperature at eye level; cleaned thermometer from stem to bulb (clean to dirty)', marks: 1 },
      { id: 5, phase: 'Execution', text: 'Palpated radial pulse using pads of three fingers for 60 seconds; noted rate, rhythm, and volume', marks: 2 },
      { id: 6, phase: 'Execution', text: 'Subtly counted respiratory rate for 60 full seconds by observing chest rise without alerting patient', marks: 2 },
      { id: 7, phase: 'Execution', text: 'Supported arm at heart level; applied appropriate sized cuff 2.5 cm above antecubital fossa with artery marker aligned', marks: 2 },
      { id: 8, phase: 'Execution', text: 'Palpated radial pulse, inflated cuff to determine palpatory systolic; deflated completely and waited 30s', marks: 2 },
      { id: 9, phase: 'Execution', text: 'Placed stethoscope over brachial pulse; reinflated cuff 30 mmHg above palpatory level; deflated at 2-3 mmHg/sec', marks: 2 },
      { id: 10, phase: 'Execution', text: 'Accurately identified Phase I Korotkoff sound (Systolic) and Phase V (Diastolic); deflated rapidly', marks: 2 },
      { id: 11, phase: 'Post-Procedure', text: 'Repositioned patient, explained findings, discarded swabs, and documented TPR & BP in clinical chart', marks: 2 }
    ]
  },
  {
    id: 'PROC-NF-03',
    subjectId: 'NF',
    name: 'Adult Intramuscular (IM) Injection (Ventrogluteal)',
    semester: 'Semester II',
    defaultDurationSeconds: 300,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Administering wrong medication/dose, or recapping needle with both hands',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Verified physician order against 6 Rights of medication administration; checked expiry date', marks: 2 },
      { id: 2, phase: 'Preparation', text: 'Identified patient with 2 identifiers; assessed drug allergies; explained procedure and secured consent', marks: 1 },
      { id: 3, phase: 'Preparation', text: 'Performed WHO hand hygiene; donned clean disposable gloves; inspected ampoule integrity', marks: 2 },
      { id: 4, phase: 'Preparation', text: 'Snapped ampoule safely away with gauze; drew medication with drawing needle; expelled air at eye level', marks: 2 },
      { id: 5, phase: 'Preparation', text: 'Replaced drawing needle with a fresh sterile IM needle (21G or 22G, 1.5 inch)', marks: 1 },
      { id: 6, phase: 'Execution', text: 'Positioned patient in side-lying (Sims) position with upper knee flexed to relax gluteal muscles', marks: 1 },
      { id: 7, phase: 'Execution', text: 'Accurately located Ventrogluteal site: Palm on greater trochanter, index on ASIS, middle on iliac crest; center of V', marks: 3 },
      { id: 8, phase: 'Execution', text: 'Disinfected site with 70% alcohol swab in circular motion outward (2 inches); allowed 30s to air dry', marks: 1 },
      { id: 9, phase: 'Execution', text: 'Held skin taut (or Z-track); inserted needle smoothly at 90° angle with quick dart-like motion', marks: 2 },
      { id: 10, phase: 'Execution', text: 'Aspirated plunger for 5-10 seconds to verify absence of blood return', marks: 1 },
      { id: 11, phase: 'Execution', text: 'Injected medication slowly at steady rate (~10 sec/mL); waited 5s before smooth withdrawal at 90°', marks: 2 },
      { id: 12, phase: 'Post-Procedure', text: 'Applied gentle pressure with dry sterile cotton (no massage); discarded needle into White sharps container', marks: 1 },
      { id: 13, phase: 'Post-Procedure', text: 'Repositioned patient comfortably, removed gloves, washed hands, and signed Medication Administration Record (MAR)', marks: 1 }
    ]
  },
  {
    id: 'PROC-NF-04',
    subjectId: 'NF',
    name: 'Female Indwelling Foley Catheterization',
    semester: 'Semester II',
    defaultDurationSeconds: 420,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Direct breach of sterile field during catheter insertion or contaminating dominant hand',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Verified doctor order, identified patient, explained procedure, ensured privacy with screens, obtained consent', marks: 1 },
      { id: 2, phase: 'Preparation', text: 'Performed hand hygiene; positioned patient in dorsal recumbent position with knees flexed; placed Mackintosh', marks: 1 },
      { id: 3, phase: 'Preparation', text: 'Opened sterile catheter tray using aseptic technique; donned sterile surgical gloves maintaining strict sterile field', marks: 2 },
      { id: 4, phase: 'Preparation', text: 'Tested Foley catheter balloon with sterile water; lubricated catheter tip (1-2 inches) with water-soluble jelly', marks: 2 },
      { id: 5, phase: 'Execution', text: 'Non-dominant hand retracted labia minora to expose meatus; maintained retraction continuously until inserted', marks: 3 },
      { id: 6, phase: 'Execution', text: 'Dominant hand with forceps cleaned meatus with antiseptic cotton balls (front-to-back, single swab per stroke)', marks: 2 },
      { id: 7, phase: 'Execution', text: 'Inserted lubricated catheter gently into urethral meatus until urine flowed (approx. 2-3 inches)', marks: 2 },
      { id: 8, phase: 'Execution', text: 'Advanced catheter an additional 1 to 2 inches after urine return before balloon inflation', marks: 2 },
      { id: 9, phase: 'Execution', text: 'Inflated retention balloon slowly with 10 mL sterile water; pulled back gently until snug resistance felt', marks: 2 },
      { id: 10, phase: 'Post-Procedure', text: 'Connected drainage bag, secured catheter to inner thigh with slack, hung bag below bladder level on bed frame', marks: 1 },
      { id: 11, phase: 'Post-Procedure', text: 'Disposed soiled swabs in Yellow BMW bag; removed gloves; washed hands; documented size, volume, urine appearance', marks: 2 }
    ]
  },
  {
    id: 'PROC-AHN-01',
    subjectId: 'AHN',
    name: 'Adult Basic Life Support (BLS / CPR) with AED',
    semester: 'Semester III',
    defaultDurationSeconds: 300,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Failing to clear victim before defibrillator shock or pause compressions for > 10 seconds',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Verified scene safety for rescuer and victim', marks: 1 },
      { id: 2, phase: 'Preparation', text: 'Checked responsiveness by firmly tapping shoulders and shouting "Are you okay?"', marks: 1 },
      { id: 3, phase: 'Preparation', text: 'Shouted for help: "Call hospital Code Blue / 108; bring crash cart and AED!"', marks: 1 },
      { id: 4, phase: 'Execution', text: 'Simultaneously checked carotid pulse and breathing for at least 5 but no more than 10 seconds', marks: 2 },
      { id: 5, phase: 'Execution', text: 'Positioned heel of hand on center of chest (lower half of sternum), interlaced fingers, kept elbows locked', marks: 2 },
      { id: 6, phase: 'Execution', text: 'Delivered 30 chest compressions: Depth 5-6 cm (2-2.4 in), Rate 100-120/min, with complete chest recoil', marks: 4 },
      { id: 7, phase: 'Execution', text: 'Opened airway using Head-Tilt Chin-Lift maneuver (or Jaw-Thrust if trauma suspected)', marks: 1 },
      { id: 8, phase: 'Execution', text: 'Delivered 2 rescue breaths using Bag-Valve-Mask (EC-clamp seal) over 1s each, observing chest rise', marks: 2 },
      { id: 9, phase: 'Execution', text: 'Maintained 30:2 compression-to-ventilation ratio with minimal interruption (< 10 seconds)', marks: 2 },
      { id: 10, phase: 'Execution', text: 'Turned ON AED; applied pads correctly (Right upper chest below clavicle, Left mid-axillary line)', marks: 2 },
      { id: 11, phase: 'Execution', text: 'Cleared victim during rhythm analysis; cleared victim and shocked when advised; resumed CPR immediately', marks: 2 }
    ]
  },
  {
    id: 'PROC-PED-01',
    subjectId: 'PED',
    name: 'Neonatal Resuscitation Protocol (NRP / NSSK)',
    semester: 'Semester V',
    defaultDurationSeconds: 300,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Suctioning nose before mouth or applying excessive ventilation pressure without chest rise',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Asked 3 rapid questions at birth: Term? Good tone? Breathing or crying?', marks: 1 },
      { id: 2, phase: 'Preparation', text: 'Placed newborn under preheated radiant warmer; removed wet linen immediately to prevent hypothermia', marks: 1 },
      { id: 3, phase: 'Execution', text: 'Positioned head in neutral or slight sniffing position using a shoulder roll under neck', marks: 2 },
      { id: 4, phase: 'Execution', text: 'Suctioned Mouth first, then Nose (M before N) using bulb syringe or suction catheter (< 100 mmHg)', marks: 3 },
      { id: 5, phase: 'Execution', text: 'Dried baby thoroughly with warm towel; gently stimulated soles or back (maximum 2 times)', marks: 2 },
      { id: 6, phase: 'Execution', text: 'Assessed breathing and heart rate (auscultated apical pulse for 6 seconds x 10)', marks: 2 },
      { id: 7, phase: 'Execution', text: 'Initiated Positive Pressure Ventilation (PPV) with neonatal bag if apneic or HR < 100 bpm', marks: 3 },
      { id: 8, phase: 'Execution', text: 'Applied correct mask size covering mouth, nose, and chin (avoiding eyes); formed airtight seal', marks: 2 },
      { id: 9, phase: 'Execution', text: 'Ventilated at rate of 40-60 breaths/min ("Breathe, two, three...") ensuring visible chest rise', marks: 2 },
      { id: 10, phase: 'Execution', text: 'Attached pulse oximeter probe to Right Hand / Wrist (Pre-ductal saturation); reassessed HR after 30s', marks: 2 }
    ]
  },
  {
    id: 'PROC-OBG-01',
    subjectId: 'OBG',
    name: 'Antenatal Abdominal Palpation (Leopold Maneuvers & FHS)',
    semester: 'Semester VII',
    defaultDurationSeconds: 300,
    maxMarks: 20,
    stationType: 'Manned',
    redFlag: 'Failing to differentiate maternal radial pulse from fetal heart sounds during auscultation',
    steps: [
      { id: 1, phase: 'Preparation', text: 'Checked records (LMP, EDD); explained procedure; ensured bladder was emptied before examination', marks: 1 },
      { id: 2, phase: 'Preparation', text: 'Maintained privacy; draped mother exposing abdomen; positioned supine with knees slightly flexed; warmed hands', marks: 2 },
      { id: 3, phase: 'Execution', text: 'Inspected abdomen for shape, contour, surgical scars, striae gravidarum, and linea nigra', marks: 1 },
      { id: 4, phase: 'Execution', text: 'Fundal Height: Placed ulnar border at fundus; measured from symphysis pubis with tape inverted (blind measurement)', marks: 2 },
      { id: 5, phase: 'Execution', text: 'Fundal Grip (1st): Palpated fundus facing woman; differentiated breech (soft, irregular) from head (hard, ballotable)', marks: 3 },
      { id: 6, phase: 'Execution', text: 'Lateral Grip (2nd): Held one side steady; palpated for convex curvature (fetal back) vs knob-like limbs', marks: 3 },
      { id: 7, phase: 'Execution', text: 'Pawlik Grip (3rd): Grasped lower pole above pubic bone with right hand; assessed if head is ballotable or engaged', marks: 3 },
      { id: 8, phase: 'Execution', text: 'Pelvic Grip (4th): Faced mother feet; pressed downward into pelvis; checked convergence/divergence for descent', marks: 2 },
      { id: 9, phase: 'Execution', text: 'FHS Auscultation: Placed Pinard/Doppler over fetal back; simultaneously palpated maternal radial pulse to differentiate', marks: 2 },
      { id: 10, phase: 'Post-Procedure', text: 'Counted FHS for full 1 minute (110-160 bpm); helped mother sit comfortably; documented lie, presentation, position, and FHR', marks: 1 }
    ]
  }
];

export const PRELOADED_EXAMINERS = [
  { id: 'FAC-01', name: 'Dr. Sunita Sharma', designation: 'Professor & HOD', pin: '1101', email: 's.sharma@nursing.edu' },
  { id: 'FAC-02', name: 'Ms. Rekha Verma', designation: 'Associate Professor', pin: '1102', email: 'r.verma@nursing.edu' },
  { id: 'FAC-03', name: 'Mr. Rajesh Kumar', designation: 'Assistant Professor', pin: '1103', email: 'r.kumar@nursing.edu' },
  { id: 'FAC-04', name: 'Ms. Ananya Roy', designation: 'Clinical Instructor', pin: '1104', email: 'a.roy@nursing.edu' },
  { id: 'FAC-05', name: 'Dr. Meenakshi Iyer', designation: 'Associate Professor', pin: '1105', email: 'm.iyer@nursing.edu' },
  { id: 'FAC-06', name: 'Ms. Pooja Patel', designation: 'Clinical Instructor', pin: '1106', email: 'p.patel@nursing.edu' }
];

export const PRELOADED_STUDENTS = [
  { id: 'STU-01', serialNo: 1, rollNo: '01', name: 'Aarav Mehta', fatherName: 'Sanjay Mehta', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-001', gender: 'Male', status: 'Present' },
  { id: 'STU-02', serialNo: 2, rollNo: '02', name: 'Bhavna Joshi', fatherName: 'Ramesh Joshi', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-002', gender: 'Female', status: 'Present' },
  { id: 'STU-03', serialNo: 3, rollNo: '03', name: 'Chirag Sen', fatherName: 'Alok Sen', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-003', gender: 'Male', status: 'Present' },
  { id: 'STU-04', serialNo: 4, rollNo: '04', name: 'Divya Nair', fatherName: 'Madhavan Nair', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-004', gender: 'Female', status: 'Present' },
  { id: 'STU-05', serialNo: 5, rollNo: '05', name: 'Eshita Gupta', fatherName: 'Rajeev Gupta', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-005', gender: 'Female', status: 'Present' },
  { id: 'STU-06', serialNo: 6, rollNo: '06', name: 'Farhan Ali', fatherName: 'Imran Ali', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-006', gender: 'Male', status: 'Present' },
  { id: 'STU-07', serialNo: 7, rollNo: '07', name: 'Gargi Kulkarni', fatherName: 'Vikas Kulkarni', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-007', gender: 'Female', status: 'Present' },
  { id: 'STU-08', serialNo: 8, rollNo: '08', name: 'Harsh Vardhan', fatherName: 'Devendra Vardhan', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-008', gender: 'Male', status: 'Present' },
  { id: 'STU-09', serialNo: 9, rollNo: '09', name: 'Ishita Roy', fatherName: 'Subhash Roy', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-009', gender: 'Female', status: 'Present' },
  { id: 'STU-10', serialNo: 10, rollNo: '10', name: 'Jatin Malhotra', fatherName: 'Sunil Malhotra', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-010', gender: 'Male', status: 'Present' },
  { id: 'STU-11', serialNo: 11, rollNo: '11', name: 'Kavya Pillai', fatherName: 'Narayanan Pillai', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-011', gender: 'Female', status: 'Present' },
  { id: 'STU-12', serialNo: 12, rollNo: '12', name: 'Lakshya Yadav', fatherName: 'Harish Yadav', semester: 'Semester II', academicYear: '2025-2026', prn: 'BScN-2024-012', gender: 'Male', status: 'Present' },
  { id: 'STU-13', serialNo: 13, rollNo: '13', name: 'Manvi Deshmukh', fatherName: 'Anil Deshmukh', semester: 'Semester IV', academicYear: '2025-2026', prn: 'BScN-2023-013', gender: 'Female', status: 'Present' },
  { id: 'STU-14', serialNo: 14, rollNo: '14', name: 'Naveen Reddy', fatherName: 'Prasad Reddy', semester: 'Semester IV', academicYear: '2025-2026', prn: 'BScN-2023-014', gender: 'Male', status: 'Present' },
  { id: 'STU-15', serialNo: 15, rollNo: '15', name: 'Ojasvi Pandey', fatherName: 'Kamlesh Pandey', semester: 'Semester VI', academicYear: '2025-2026', prn: 'BScN-2022-015', gender: 'Female', status: 'Present' },
  { id: 'STU-16', serialNo: 16, rollNo: '16', name: 'Pranav Bhat', fatherName: 'Girish Bhat', semester: 'Semester VI', academicYear: '2025-2026', prn: 'BScN-2022-016', gender: 'Male', status: 'Present' },
  { id: 'STU-17', serialNo: 17, rollNo: '17', name: 'Riya Saxena', fatherName: 'Manish Saxena', semester: 'Semester VIII', academicYear: '2025-2026', prn: 'BScN-2021-017', gender: 'Female', status: 'Present' },
  { id: 'STU-18', serialNo: 18, rollNo: '18', name: 'Sahil Kapoor', fatherName: 'Deepak Kapoor', semester: 'Semester VIII', academicYear: '2025-2026', prn: 'BScN-2021-018', gender: 'Male', status: 'Present' }
];

export const DEFAULT_EXAM_CONFIG = {
  id: 'EXAM-2026-NURS-01',
  title: 'B.Sc. Nursing Semester II Summative OSCE',
  subjectId: 'NF',
  semester: 'Semester II',
  academicYear: '2025-2026',
  date: new Date().toISOString().split('T')[0],
  stationCount: 6,
  durationMinutes: 5,
  warningTimeSeconds: 60,
  rotationMode: 'CIRCULAR_RING',
  absenteePolicy: 'DYNAMIC_BUFFER',
  currentRound: 1,
  totalRounds: 6,
  status: 'Scheduled',
  stations: [
    { stationNumber: 1, procedureId: 'PROC-NF-01', examinerId: 'FAC-01', room: 'Skill Lab Bed 1' },
    { stationNumber: 2, procedureId: 'PROC-NF-03', examinerId: 'FAC-02', room: 'Skill Lab Bed 2' },
    { stationNumber: 3, procedureId: 'PROC-NF-04', examinerId: 'FAC-03', room: 'Catheterization Booth' },
    { stationNumber: 4, procedureId: 'PROC-AHN-01', examinerId: 'FAC-04', room: 'Emergency Resuscitation Unit' },
    { stationNumber: 5, procedureId: 'PROC-PED-01', examinerId: 'FAC-05', room: 'Pediatric Warmer Station' },
    { stationNumber: 6, procedureId: 'PROC-OBG-01', examinerId: 'FAC-06', room: 'Antenatal Examination Room' }
  ]
};
