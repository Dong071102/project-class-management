import { useState, useEffect } from "react";
import HeroImg from "../../assets/IconHomePage/banner.png";
import HeroImg2 from "../../assets/IconHomePage/banner1.jpg";
import HeroImg3 from "../../assets/IconHomePage/banner2.jpg";
import Navbar from "../navbar/Navbar";
import Button from "../button/Button";

const banners = [HeroImg, HeroImg2, HeroImg3];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      nextBanner();
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const nextBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };
  const selectBanner = (index: number) => {
    setCurrentIndex(index);
  };
  return (
    <div
      className="relative w-full h-[120vh] bg-cover bg-center rounded-[4%] transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(to top right, rgba(171, 179, 137, 0.67), rgba(18, 37, 20, 0.73)), url(${banners[currentIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      
    >
      <Navbar />
      <div className="flex items-center text-left h-full pl-[6%] absolute top-1/2 transform -translate-y-1/2 mt-[2%]">
        <div className="w-[66%] flex justify-center flex-col text-left">
          <button className="w-[16%] h-[3.5%] py-1 px-2 border border-white rounded-full text-white flex items-center justify-center mb-[3%] overflow-hidden ">
            <p className="text-white text-[1.2vw] whitespace-nowrap max-w-full truncate">DL FARM</p>
          </button>

          <h1 className="text-[5vw] leading-[120%] text-white">
            Tự Nhiên Nuôi Dưỡng Cuộc Sống
          </h1>
          <hr className="w-full border-t-1 border-white my-[2%]" />
          <p className="text-[1.5vw] leading-[150%] text-white mb-[3%]">
            Chúng tôi cung cấp vật nuôi khỏe mạnh, rau sạch, an toàn từ nông trại đến bàn ăn.
          </p>
          <Button text="Liên Hệ Ngay" backgroundColor="#FFFFFF" iconType="arrow" />
        </div>
      </div>
      <div className="absolute top-1/2 right-5 transform -translate-y-1/2 flex flex-col gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => selectBanner(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>

    </div>
  );
};

export default Banner;
