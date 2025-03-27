import axios from "axios";
import { User } from "../model/User";
import Cookies from "js-cookie";

// URL endpoint của API để làm mới accessToken
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`; // Thay bằng URL thực tế của bạn

// Hàm refresh accessToken
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = Cookies.get("refreshToken");
        // Gửi yêu cầu tới API để làm mới accessToken
        const response = await axios.post(API_URL, {}, {
            headers: {
                'Content-Type': 'application/json',  // Đảm bảo định dạng JSON
                'Authorization': `Bearer ${refreshToken}`  // Gửi refreshToken trong Authorization header
            }
        });
        // Lấy accessToken mới từ phản hồi của API
        const newAccessToken = response.data.accessToken;

        // Lưu accessToken vào sessionStorage
        sessionStorage.setItem("accessToken", newAccessToken);

        // Trả về accessToken mới
        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return null; // Trả về null nếu có lỗi
    }
};

// Hàm để lấy refreshToken từ cookie
export const getRefreshTokenFromCookie = (): string | undefined => {
    return Cookies.get("refreshToken");
};
export const getTokenExpirationTime = (token: string): number => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
        throw new Error("Token không hợp lệ");
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.exp;
};

export const getCurrentUser = async (): Promise<User> => {
    const accessToken = sessionStorage.getItem("accessToken");

    // Kiểm tra nếu accessToken không tồn tại
    if (!accessToken) {
        throw new Error("Access token không tồn tại. Người dùng chưa đăng nhập.");
    }

    try {
        // Kiểm tra xem accessToken có hết hạn không
        const accessTokenExpirationTime = getTokenExpirationTime(accessToken);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

        if (accessTokenExpirationTime <= currentTime) {
            // Nếu accessToken hết hạn, làm mới accessToken bằng refreshToken
            console.log("Access token đã hết hạn, làm mới access token...");
            await refreshAccessToken();  // Gọi hàm làm mới accessToken
        }

        // Sau khi làm mới token (nếu cần), gọi API để lấy thông tin người dùng
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,  // Gửi accessToken trong header
            },
        });
        const user: User = {
            userId: response.data.user_id,
            username: response.data.username,
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            email: response.data.email,
            role: response.data.role,
            imageUrl: response.data.image_url || "",  // Optional field
        };

        return user;
    } catch (error) {
        console.error("Error fetching user data", error);
        throw error;  // Ném lỗi để xử lý ở nơi gọi
    }
};

export const decodedToken = (token: string): any => {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
    }

    const payload = JSON.parse(atob(tokenParts[1])); // Giải mã payload của token
    return payload;
};