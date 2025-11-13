export interface User {
    _id:string;
    id: string;
    name: string;
    employeeId: string;
    department: string;
    position?: string;
    salary?: number;
    email: string;
    phoneNumber?: string;
    location?: string;
    status?: 'active' | 'inactive';
    image?: string;
    role?: string;
}
