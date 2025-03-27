import { useState, useEffect } from "react";
import CameraStatus from "./CameraStatus";
import { useNotification } from "../../contexts/NotificationContext";
interface EventData {
    event_type: string;
    event_time: string;
    video_recorded: string;
    cameraID: string;
}

const CameraStream = ({ camId }: { camId: string }) => {
    const { addNotification } = useNotification(); 
    const [frameSrc, setFrameSrc] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [personDetected, setPersonDetected] = useState(false);
    const [detections, setDetections] = useState(0);
    const [abnormalDetections, setAbnormalDetections] = useState<{ imageUrl: string; title: string; timestamp: string; description: string; link: string }[]>([]);
    const [events, setEvents] = useState<EventData[]>([]);
    const [nameFile, setNameFile] = useState<string>();
    const API_URL = "http://127.0.0.1:8000";
    const WS_URL = `ws://localhost:8765/${camId}`;
    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "video_frame") {
                setFrameSrc(`data:image/jpeg;base64,${data.frame}`);
                sendFrameToApi(data.frame);
            } else if (data.type === "welcome" || data.type === "error") {
                console.log(data.message);
            }
        };

        ws.onopen = () => console.log("Connected to WebSocket server");
        ws.onclose = () => console.log("Disconnected from WebSocket server");

        return () => ws.close();
    }, []);

    const sendFrameToApi = async (frame:any) => {
        const formData = new FormData();
        formData.append("file", dataURItoBlob(`data:image/jpeg;base64,${frame}`), "frame.jpg");

        try {
            const response = await fetch(`${API_URL}/detect`, { method: "POST", body: formData });
            const result = await response.json();

            if (result.person_detected) {
                setAlertMessage("🚨 Person detected!");
                setPersonDetected(true)
                setDetections((prev) => prev + 1);
                addNotification("Phát hiện bất thường", "Có người xuất hiện trong khu vực!");
                setAbnormalDetections((prev) => [
                    ...prev,
                    {
                        imageUrl: `data:image/jpeg;base64,${frame}`,
                        title: "Phát hiện bất thường",
                        timestamp: new Date().toLocaleString(),
                        description: "Phát hiện có người xuất hiện trong khu vực.",
                        link: "#",
                    },
                ]);
                if (result) {
                    fetchEvents(); 
                }
            } else {
                setAlertMessage("");
                setPersonDetected(false)
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/latest_event`); 
            const data = await response.json();
            console.log("Data latest_event:", data);
            if (Array.isArray(data.latest_event)) {
                setEvents(data.latest_event); 
                setNameFile(data.video_id);
            } else {
                setEvents([]); 
            }
        } catch (error) {
            console.error("error events:", error);
            setEvents([]); 
        }
    };
    
    useEffect(() => {
        fetchEvents();
    }, []);
    const dataURItoBlob = (dataURI:string) => {
        const byteString = atob(dataURI.split(",")[1]);
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    return (
        <>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start max-h-[900px] h-full">
            <div className="text-left md:col-span-2 flex flex-col h-full ">
                <div style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>
                    {alertMessage ? alertMessage : "Nobody here"}
                </div>
                <div className="relative">
                    <img 
                        src={frameSrc} 
                        alt="Camera Feed" 
                         className="w-full h-full max-h-[500px] object-contain"
                    />
                    <p className="absolute bottom-4 left-4 bg-gray-400 text-white text-sm px-2 py-1 rounded-md">
                        {camId}
                    </p>
                </div>
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">📋 Lịch sử sự kiện</h3>
                    <ul className="mt-2 space-y-2">
                        {events.length > 0 ? (
                            events.map((event, index) => (
                                <li key={index} className="p-2 border-b last:border-none">
                                    <p className="text-sm">
                                        <strong>{event.event_type}</strong> - {new Date(event.event_time).toLocaleString()}
                                    </p>
                                    <a
                                        href={`${API_URL}/download/${nameFile}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 text-sm"
                                    >
                                        📥 Tải video
                                    </a>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Chưa có sự kiện nào.</p>
                        )}
                    </ul>
                </div>
                
            </div>
            <div className="grid grid-cols-1 gap-2 md:col-span-1 self-start h-auto min-h-0">
                <CameraStatus
                    totalAnimals={10010}
                    noChangeMessage={detections > 0 ? `Số lượng giảm ${detections}` : "Số lượng không thay đổi"}
                    detections={detections}
                    abnormalDetections={abnormalDetections}
                    personDetected={personDetected}
                />
            </div>
            
    </div>
        </>
        
    
    );
};

export default CameraStream;
