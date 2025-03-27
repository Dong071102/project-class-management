export interface User {
    userId: string;   // UUID (sử dụng string trên frontend)
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    imageUrl?: string; // Optional (Nếu có ảnh)
}
