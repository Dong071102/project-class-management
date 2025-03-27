import { useNotification } from "../contexts/NotificationContext";
import NotificationCard from "./card/NotificationCard";

const NotificationContainer = () => {
    const { notifications } = useNotification();

    return (
        <div className="fixed top-4 right-4 w-[300px] z-50">
            {notifications.map((notif) => (
                <NotificationCard key={notif.id} {...notif} />
            ))}
        </div>
    );
};

export default NotificationContainer;
