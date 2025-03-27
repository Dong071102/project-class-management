import JobAlertCard from "../../components/card/JobAlertCard";
import { LuClipboardX ,LuClipboardList,LuClipboardCheck } from "react-icons/lu";
import PieChartComponent from "./PieChartComponent";
const JobReport = () => {
    return (
      <div>
        <div className="bg-black text-white p-5 rounded-t-[16px] ">Ngày tháng năm</div>

        <div className="bg-white rounded-b-[16px] p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-3 bg-[#F3F0EB] rounded-[16px] space-y-4">
            <div className=" flex gap-2  ">
              <LuClipboardX className="w-6 h-6 text-[#A1A3AB]"/>
              <p className="font-bold text-[#FFA412] mt-2">Công việc quá hạn</p>
            </div>
            <JobAlertCard
            title="Cho dê ăn"
            description="Cho dê ăn cái này cái kia cái gì đó đó cái này cái nọ rồi cái gì đó nữa"
            assignee="Moderate"
            status="Quá hạn"
            color="red"
            date="20/06/2023"
            />
            <JobAlertCard
            title="Cho dê ăn"
            description="Cho dê ăn cái này cái kia cái gì đó đó cái này cái nọ rồi cái gì đó nữa"
            assignee="Moderate"
            status="Quá hạn"
            color="red"
            date="20/06/2023"
            />
            <JobAlertCard
            title="Cho dê ăn"
            description="Cho dê ăn cái này cái kia cái gì đó đó cái này cái nọ rồi cái gì đó nữa"
            assignee="Moderate"
            status="Quá hạn"
            color="red"
            date="20/06/2023"
            />
          </div>

          <div className="">
            <div className="p-3 bg-[#F3F0EB] rounded-[16px] space-y-4 mb-4">
              <div className=" flex gap-2  ">
                <LuClipboardCheck  className="w-6 h-6 text-[#A1A3AB]"/>
                <p className="font-bold text-[#FFA412] mt-2">Tiến độ công việc</p>
              </div>
              <div className="flex justify-center space-x-6 p-4">
              <PieChartComponent percentage={100} />
              <PieChartComponent percentage={84} />
              <PieChartComponent percentage={13} />
              </div>
            </div>

            <div className="p-3 bg-[#F3F0EB] rounded-[16px] space-y-4">
              <div className=" flex gap-2  ">
                <LuClipboardList className="w-6 h-6 text-[#A1A3AB]"/>
                <p className="font-bold text-[#FFA412] mt-2">Lịch sử công việc</p>
              </div>
              <JobAlertCard
                title="Cho dê ăn"
                description="Cho dê ăn cái này cái kia cái gì đó đó cái này cái nọ rồi cái gì đó nữa"
                assignee="Ảnh meme"
                status="Hoàn thành"
                color="green"
                date="20/06/2023"
              />
              <JobAlertCard
                title="Cho dê ăn"
                description="Cho dê ăn cái này cái kia cái gì đó đó cái này cái nọ rồi cái gì đó nữa"
                assignee="Ảnh meme"
                status="Hoàn thành"
                color="green"
                date="20/06/2023"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
    export default JobReport;
    