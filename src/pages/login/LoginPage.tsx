import React, { useState, useContext, ChangeEvent, MouseEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Hello from "../../assets/IconHomePage/hello.png";
import LoginArt from "../../assets/background.jpg";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../../hooks/user";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Khai báo navigate
  const { loginApi } = useContext(AuthContext);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
    setLoading(false);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
    setLoading(false);
  };
  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu!");
      setLoading(false);
      return;
    }

    try {
      // Gọi API đăng nhập
      await loginApi({ username_or_email: email, password: password });

      // Nếu login thành công, chuyển hướng tới Dashboard
      navigate("/dashboard");
    } catch (error: any) {
      // Xử lý lỗi nếu có
      if (error.response?.status === 401) {
        setError("Sai tài khoản hoặc mật khẩu");
      } else {
        setError(error.response?.data?.message || "Đăng nhập thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen  overflow-hidden">
      <img src={LoginArt} alt="Login Art" className=" w-full h-full object-cover " />
      <div className="flex w-[70%] h-[70%] items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-[32px]">


        <div className="  md:w-[30%] flex items-center justify-center p-6">

          <div>
            <img className="w-[72%] p-3 mx-auto mb-[12%]" src={Hello} alt="Hello" />
            <form>
              <div className="mb-4">
                <span className="block text-left text-[#0C1421] mb-2">Tên đăng nhập</span>
                <input
                  placeholder="aido@example.com"
                  id="email"
                  className="w-full p-3 border border-[#D4D7E3] rounded-[100px] text-black bg-white"
                  type="email"
                  name="email"
                  onChange={handleEmailChange}
                  value={email}
                />
              </div>

              <div className="mb-4 relative">
                <span className="block text-left text-[#0C1421] mb-2">Mật khẩu</span>
                <input
                  id="password"
                  className="w-full p-3 border border-[#D4D7E3] rounded-[100px] text-black bg-white"
                  type="password"
                  name="password"
                  placeholder="Ít nhất 8 kí tự ..."
                  onChange={handlePasswordChange}
                  value={password}
                />
                <div className="flex align-center justify-between mt-2">
                  {err && <p className="text-red-500 text-sm text-left">{err}</p>}
                  <a href="/" className="hover:underline cursor-pointer text-sm text-green-600 absolute right-0">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              <button
                disabled={!email || !password}
                onClick={handleClick}
                className={`w-full p-3 mt-6 rounded-[100px] transition ${!email || !password ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white cursor-pointer"}`}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              <div className="flex items-center w-full my-4">
                <hr className="flex-1 border-t-2 border-[#CFDFE2]" />
                <p className="mx-4 text-black whitespace-nowrap">Hoặc</p>
                <hr className="flex-1 border-t-2 border-[#CFDFE2]" />
              </div>

              {/* Đăng nhập bằng Google */}
              <button
                onClick={handleClick}
                className="w-full p-3 rounded-[100px] bg-black text-white flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="text-base">Đăng nhập bằng Google</span>
              </button>
            </form>
          </div>
        </div>
        <div className="hidden md:flex w-[70%] h-full items-center justify-center bg-cover overflow-hidden m-5 relative">
          <img src={LoginArt} alt="Login Art" className=" max-w-full max-h-full object-cover rounded-[32px]" />
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
