import {FaCircle} from "react-icons/fa";

type JobAlertCardProps={
    title:string;
    description:string;
    assignee:string;
    status:string;
    color:string;
    date:string;
}

const JobAlertAlertCard=({title, description, assignee, status, color, date}:JobAlertCardProps)=>{
    return (
        <div className="p-4 flex items-start gap-3 rounded-lg border relative" style={{borderColor:color}}>
            <FaCircle className="w-3 h-3" style={{color}}/>
            <div className="flex-1 text-left gap-1 mb-2">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-gray-700 my-2">{description}</p>
                <p className="text-sm text-[#42ADE2]">
                    <span className="font-medium text-black">Người phụ trách: </span>{assignee}
                </p>
                <p className="text-sm" style={{color}}>
                    <span className="text-black">Trạng thái: </span>{status}
                </p>
            </div>
            <p className="text-sx text-gray-500 absolute bottom-2 right-2">Tạo vào: {date}</p>

        </div>
    )
}

export default JobAlertAlertCard;