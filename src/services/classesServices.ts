
export const fetchAttendaceSummary = async (userId: string, classId?: string) => {
    try {
        let url = `${import.meta.env.VITE_API_BASE_URL}/${userId}`
        if (classId) {
            url += `${classId}`
        }
        const response = await fetch(url);
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error("Error fetching:", error);
    }
};