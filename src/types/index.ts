export type Category = 
  | 'PWD'
  | 'YI_MEMBER'
  | 'SPECIAL_INVITEE';

export interface CommonFields {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  organization?: string;
  emergencyContact?: string;
  howDidYouHear?: string;
  howDidYouHearOther?: string;
  guardianDetails?: string;
  previousEventIssues?: string;
}

export interface PwdFields {
  disabilityType?: string;
  disabilityOther?: string;
  institutionName: string;
  specialRequirements?: string;
  hasCaretaker?: boolean;
  caretakerName?: string;
  caretakerTShirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '';
}

export interface YiMemberFields {
  employer: string;
  yiChapter: string;
  willingToWalkWithPwd: boolean;
  hasFamilyMember?: boolean;
  familyMemberName?: string;
  familyMemberTShirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | '';
}

export type RegistrationFormValues = CommonFields & {
  category: Category;
} & Partial<PwdFields> 
  & Partial<YiMemberFields>;

export interface RegistrationStatus {
  id: string;
  status: 'Confirmed' | 'Checked In' | 'Pending Sync (Offline)';
  details: RegistrationFormValues;
}
