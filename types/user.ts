export interface User {
  id: number;
  fullname: string;
  role: 'admin' | 'staff' | 'student';
  profile_image?: string;
  email: string;
}
