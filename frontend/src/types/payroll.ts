export interface Company {
  id: number;
  name: string;
  owner: string;
  treasury: string;
  employeeCount: number;
  totalPaid: number;
  createdAt: number;
  active: boolean;
}

export interface Employee {
  wallet: string;
  name: string;
  salary: number; // in micro-units/token decimal
  startDate: number;
  active: boolean;
  totalReceived: number;
  lastPaidAt: number;
}

export interface PaymentRecord {
  id: number;
  companyId: number;
  employee: string;
  amount: number;
  paidAt: number;
  memo: string;
}

export type UserRole = 1 | 2 | 3; // 1 = Admin, 2 = Manager, 3 = Viewer

export interface CompanyMember {
  wallet: string;
  role: UserRole;
}

export interface DashboardStats {
  totalPaid: number;
  employeeCount: number;
  paymentCount: number;
  treasuryBalance: string;
  activeEmployees: number;
}
