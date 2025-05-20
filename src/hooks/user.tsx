import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import axios from "axios";
import { refreshAccessToken, getRefreshTokenFromCookie, getTokenExpirationTime, getCurrentUser, decodedToken } from "../services/authServices";
import Cookies from "js-cookie";
import { User } from "../model/User";



interface AuthContextType {
  currentUser: User | null;
  accessToken: string | null;
  loginApi: (inputs: { username_or_email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  currentUser: null,
  accessToken: null,
  loginApi: async () => Promise.resolve(),
  logout: () => { },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(JSON.parse(localStorage.getItem("user") || "null"));
  const [accessToken, setAccessToken] = useState<string | null>(sessionStorage.getItem("accessToken"));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshToken = getRefreshTokenFromCookie(); // Lấy refreshToken từ cookie
  console.log('refreshToken', refreshToken)
  // Hàm làm mới accessToken bằng refreshToken
  const handleRefreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return;
    }

    // Kiểm tra nếu refreshToken hết hạn
    const refreshTokenExpirationTime = getTokenExpirationTime(refreshToken);
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    if (refreshTokenExpirationTime <= currentTime) {
      console.log("Refresh token đã hết hạn, yêu cầu đăng nhập lại.");
      logout(); // Đăng xuất nếu refreshToken hết hạn
      return;
    }

    setIsLoading(true);
    try {
      // Gửi refreshToken để làm mới accessToken
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        setAccessToken(newAccessToken);
      } else {
        logout(); // Nếu không thể làm mới token, đăng xuất
      }
    } catch (error) {
      console.error("Error refreshing access token", error);
      logout(); // Nếu có lỗi, đăng xuất người dùng
    }
    setIsLoading(false);
  };


  // Hàm đăng nhập
  const loginApi = async (inputs: { username_or_email: string; password: string }) => {
    console.log(inputs)

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, inputs);
      // console.log(inputs)
      console.log(`${import.meta.env.VITE_API_BASE_URL}/auth/login`)
      // const res = await axios.post(`http://localhost:8005/auth/login`, inputs);
      const newAccessToken: string = res.data.access_token;
      const refreshToken: string = res.data.refresh_token;
      const decodedAccessToken = decodedToken(newAccessToken);
      if (decodedAccessToken.role !== "lecturer") {
        throw Error("Access denied. Only lecturers can log in.");
      }
      setAccessToken(newAccessToken);

      sessionStorage.setItem("accessToken", newAccessToken);
      Cookies.set("refreshToken", refreshToken, { secure: true, sameSite: "Strict" });
      const user: User = await getCurrentUser();
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);

    } catch (error: any) {
      // Ném lỗi ra ngoài nếu không thể đăng nhập thành công
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = useCallback(() => {
    setCurrentUser(null);
    setAccessToken(null);
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    Cookies.remove("refreshToken"); // Xóa refreshToken khỏi cookie
  }, []);

  // Kiểm tra nếu accessToken đã hết hạn, thử làm mới token
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    // Kiểm tra nếu accessToken đã hết hạn
    const accessTokenExpirationTime = getTokenExpirationTime(accessToken);
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    // Nếu accessToken hết hạn, gọi hàm làm mới token
    if (accessTokenExpirationTime <= currentTime) {
      console.log("Access token đã hết hạn, thử làm mới token...");
      handleRefreshAccessToken(); // Gọi hàm làm mới accessToken
    }

  }, [accessToken]); // Khi accessToken thay đổi
  useEffect(() => {
    if (!refreshToken) {
      return;
    }

    // Kiểm tra nếu refreshToken đã hết hạn
    const refreshTokenExpirationTime = getTokenExpirationTime(refreshToken);
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    // Nếu refreshToken hết hạn, yêu cầu người dùng đăng nhập lại
    if (refreshTokenExpirationTime <= currentTime) {
      console.log("Refresh token đã hết hạn, yêu cầu đăng nhập lại.");
      logout(); // Đăng xuất người dùng
    }

  }, [refreshToken]); // Khi refreshToken thay đổi


  return (
    <AuthContext.Provider value={{ currentUser, accessToken, loginApi, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
