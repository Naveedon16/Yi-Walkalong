export type Category = 
  | 'PWD'
  | 'YI_MEMBER'
  | 'CII_MEMBER'
  | 'YUVA'
  | 'THALIR'
  | 'GENERAL';

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
}

export interface YiMemberFields {
  employer: string;
  yiChapter: string;
  willingToWalkWithPwd: boolean;
}

export interface CiiMemberFields {
  companyName: string;
  designation: string;
}

export interface ThalirFields {
  school: string;
  coordinatorName: string;
}

export interface YuvaFields {
  college: string;
  department: string;
  year: string;
}

export interface GeneralFields {
  occupation: string;
}

export type RegistrationFormValues = CommonFields & {
  category: Category;
} & Partial<PwdFields> 
  & Partial<YiMemberFields> 
  & Partial<CiiMemberFields> 
  & Partial<ThalirFields> 
  & Partial<YuvaFields> 
  & Partial<GeneralFields>;

export interface RegistrationStatus {
  id: string;
  status: 'Confirmed' | 'Checked In' | 'Pending Sync (Offline)';
  details: RegistrationFormValues;
}
