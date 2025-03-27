import React from 'react';
import logo from "../../assets/IconHomePage/logo.png";
import footer from "../../assets/IconHomePage/Footer.png";
import { LiaPhoneVolumeSolid, LiaFacebookF } from "react-icons/lia";
import { TfiEmail } from "react-icons/tfi";
import { FaXTwitter ,FaInstagram } from "react-icons/fa6";
import { TiSocialLinkedin } from "react-icons/ti";
import { FaCircle } from "react-icons/fa";

const Footer = () => {
  return (
    <div  className=" h-auto bg-cover bg-no-repeat" style={{
        backgroundImage: `url(${footer})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
    
      <header className="bg-[#EDDD5E] py-6 ">
          <div className="w-full max-w-[76%] mx-auto flex justify-between items-center">
            <nav className="flex space-x-6 text-sm font-medium text-[#404A3D]">
              <a href="#" className="flex items-center space-x-1 text-[#404A3D]">
                <span>FARMERS</span>
              </a>
              <a href="#" className="flex items-center  space-x-1 text-[#404A3D]">
                <FaCircle className="text-white w-[9px] h-[9px] mr-4" />
                <span>ORGANIC</span>
              </a>
              <a href="#" className="flex items-center space-x-1 text-[#404A3D]">
                <FaCircle className="text-white w-[9px] h-[9px] mr-4" />
                <span>FOODS</span>
              </a>
              <a href="#" className="flex items-center space-x-1 text-[#404A3D]">
                <FaCircle className="text-white w-[9px] h-[9px] mr-4" />
                <span>PRODUCT</span>
              </a>
            </nav>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-white p-2 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    <LiaPhoneVolumeSolid className="w-6 h-6 text-[#404A3D]" />
                  </div>
                  <span className="text-sm text-[#404A3D] font-semibold">+84 123 123 123</span>
                </div>
        
                <div className="flex items-center space-x-2">
                  <div className="bg-white p-2 rounded-full w-10 h-10  flex items-center justify-center shrink-0">
                    <TfiEmail className="w-6 h-6 text-[#404A3D]" />
                  </div>
                  <span className="text-sm text-[#404A3D] font-semibold">dlfarm@gmail.com</span>
                </div>
              </div>
          </div>  
      </header>

        {/*  */}
        <footer className="py-[8%] w-full max-w-[76%] mx-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-10 gap-8">
            <div className="col-span-3">
              <div className='flex items-center'>
                <img src={logo} className='md:w-[80px] lg:w-[56px] object-cover mr-2' />
                <span className="w-[107px] h-[24px] font-[400] text-[24px] text-[#FCBD2D] tracking-[0.01em] font-[Segoe_Script]">
                  DLFarm
                </span>
              </div>
              <p className="text-sm text-[#404A3D] text-left mt-[3%]">
                Chúng tôi chuyên cung cấp các sản phẩm chất lượng từ dê và cừu, bao gồm thịt sạch, sữa tươi, và các sản phẩm chế biến tự nhiên.
              </p>
              <div className="flex space-x-4 mt-4">
                <LiaFacebookF className="text-[#5B8C51] w-10 h-10 bg-[#F8F7F0] rounded-full p-[3%]" />
                <FaXTwitter className="text-[#5B8C51] w-10 h-10 bg-[#F8F7F0] rounded-full p-[3%]" />
                <TiSocialLinkedin className="text-[#5B8C51] w-10 h-10 bg-[#F8F7F0] rounded-full p-[2%]" />
                <FaInstagram className="text-[#5B8C51] w-10 h-10 bg-[#F8F7F0] rounded-full p-[3%]" />
              </div>
            </div>
            
            <div className="col-span-7">
              <h3 className="text-[200%] leading-[120%] text-[#404A3D] text-left">
                Chúng tôi cam kết mang đến sự an tâm và chất lượng cao nhất cho khách hàng.
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#404A3D] text-left">Liên Kết</h3>
                  <ul className="space-y-1 text-sm text-[#666666] text-left">
                    <li><a href="#" className="hover:underline">Liên hệ ngay</a></li>
                    <li><a href="#" className="hover:underline">Về chúng tôi</a></li>
                    <li><a href="#" className="hover:underline">Hotline: +84 123 123 123</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#404A3D] text-left">Sản Phẩm Tiêu Biểu</h3>
                  <ul className="space-y-1 text-sm text-[#666666] text-left">
                    <li><a href="#" className="hover:underline">Thịt dê tươi sạch</a></li>
                    <li><a href="#" className="hover:underline">Phô mai cừu thủ công</a></li>
                    <li><a href="#" className="hover:underline">Các sản phẩm hữu cơ khác</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#404A3D] text-left">Địa Chỉ</h3>
                  <p className="text-sm text-[#666666] text-left">
                    Số 19 Hai Bà Trưng, Phường 6<br />
                    TP Đà Lạt, tỉnh Lâm Đồng
                  </p>
                </div>
              </div>
              <div className="border-t mt-6 pt-4 text-center flex justify-between item-center text-sm text-gray-500">
                <div className="flex space-x-4">
                  <a href="#" className="hover:underline">Terms & Conditions</a>
                  <span>|</span>
                  <a href="#" className="hover:underline">Privacy Policy</a>
                </div>
                <p className="">Copyright © 2025 <span className="underline">Dlfarm</span>, All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </footer>
    </div>
    
  );
};

export default Footer;
