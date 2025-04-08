import React from "react";

export interface HumanCouterCardProps {
    SnapshotID: string,
    ScheduleID: string,
    PeopleCounter: string,
    CapturedAt: string,
    StartTime: string,
    EndTime: string,
    ClassID: string,
    ClassName: string,
    CourseID: string,
    CourseName: string,
    RoomName: string,
    ImageSrc: string
}

const HumanCouterCard: React.FC<HumanCouterCardProps> = ({
    SnapshotID, ScheduleID, ClassID, CourseID, PeopleCounter, EndTime,
    CapturedAt, StartTime, ClassName, CourseName, RoomName, ImageSrc
}) => {


    return (
        <div className={`flex border text-[#3d6649] rounded-xl p-3 items-center shadow-md w-full `}>
            <img src={ImageSrc} alt="Alert" className="w-32 h-18 rounded-lg object-cover" />
            <div className="ml-3 flex flex-col text-left">
                <h3 className="text-[#3d6649] font-bold text-sm">Thời gian: {CapturedAt}</h3>
                <h3 className="text-[#3d6649] font-bold text-sm">Số lượng người: {PeopleCounter}</h3>
                <p className="text-black text-xs">Lớp: {ClassName}</p>
                <p className="text-black text-xs">Môn: {CourseName}</p>
                <p className="text-black text-xs">Phòng học: {RoomName}</p>
                <p className="text-black text-xs">Thời gian học: {StartTime.split(' ')[0]} - {EndTime.split(' ')[0]}</p>
            </div>
        </div>
    );
};

export default HumanCouterCard;
