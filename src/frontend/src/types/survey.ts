export interface SurveyEntry {
  id: string;
  timestamp: string;
  surveyorPrincipal: string;
  surveyorName: string;
  schoolName: string;
  session: string;
  serialNo: number;
  houseNo: string;
  wardNo: string;
  panchayat: string;
  headName: string;
  childName: string;
  fatherName: string;
  motherName: string;
  gender: string;
  caste: string;
  dob: string;
  age: string;
  studyingClass: string;
  studyingSchool: string;
  notStudyingReason: string;
  aadharNo: string;
  mobileNo: string;
  signature: string;
  photo: string;
}

export interface AppSettings {
  schoolName: string;
  session: string;
}

export const STORAGE_KEY = "household_survey_entries";
export const SETTINGS_KEY = "household_survey_settings";

export function getEntries(): SurveyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: SurveyEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { schoolName: "", session: "2025-26" };
  } catch {
    return { schoolName: "", session: "2025-26" };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
