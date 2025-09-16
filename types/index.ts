export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface Membership {
  id: string
  userId: string
  orgId: string
  role: string
  createdAt: Date
  updatedAt: Date
  user?: User
  organization?: Organization
}

export interface Attendance {
  id: string
  userId: string
  orgId: string
  checkIn: Date
  checkOut?: Date | null
  createdAt: Date
  updatedAt: Date
  user?: User
  organization?: Organization
}

export interface AttendanceFormData {
  userId: string
  orgId: string
  checkIn: string
  checkOut?: string
}
