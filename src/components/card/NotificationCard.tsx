// import { FaMinus, FaCalendarAlt } from "react-icons/fa";

// interface NotificationProps {
//   title: string;
//   description: string;
//   date: string;
// }

// const NotificationCard: React.FC<NotificationProps> = ({ title, description, date }) => {
//   return (
//     <div className="flex max-w-sm p-4 mb-2 border border-red-400 bg-red-100 rounded-lg shadow-md">
//       <div className="flex items-center justify-center w-8 h-8 bg-[#EB5757] text-white rounded-full text-xl">
//         <FaMinus />
//       </div>

//       <div className="ml-4 text-left">
//         <h3 className="text-lg font-semibold text-[#D71111]">{title}</h3>
//         <p className="text-sm text-[#FF0000]">{description}</p>
        
//         <div className="text-[#FF0000] flex items-center mt-2 text-sm">
//           <FaCalendarAlt className="mr-2" />
//           <span>{date}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationCard;
import { FaMinus, FaCalendarAlt } from "react-icons/fa";

interface NotificationProps {
  title: string;
  description: string;
  date: string;
}

const NotificationCard: React.FC<NotificationProps> = ({ title, description, date }) => {
  return (
    <div className="flex max-w-sm p-4 mb-2 border border-red-400 bg-red-100 rounded-lg shadow-md">
      <div className="flex items-center justify-center w-8 h-8 bg-[#EB5757] text-white rounded-full text-xl">
        <FaMinus />
      </div>

      <div className="ml-4 text-left">
        <h3 className="text-lg font-semibold text-[#D71111]">{title}</h3>
        <p className="text-sm text-[#FF0000]">{description}</p>
        
        <div className="text-[#FF0000] flex items-center mt-2 text-sm">
          <FaCalendarAlt className="mr-2" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
