export interface Department {
    _id: string;
    id?: string;
    name: string;
    manager: string;
    positions: string[];
    salary: number;       // added
    image?: string | null;
    createdAt?: string;
    updatedAt?: string;
}