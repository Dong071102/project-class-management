// ClassContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContext } from '../hooks/user';


export type oneClass = {
    class_id: string,
    class_name: string,
    course_id: string,
    course_name: string
};

interface ClassContextType {
    selectedClass: oneClass | null;
    setSelectedClass: (selected: oneClass | null) => void;
    classes: oneClass[];
    setClasses: (classes: oneClass[]) => void;
    loading: boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedClass, setSelectedClass] = useState<oneClass | null>(null);
    const [classes, setClasses] = useState<oneClass[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await fetch(`http://localhost:8000/classes/${currentUser?.userId}`);
                const data: oneClass[] = await response.json();
                const defaultClass = {
                    class_id: "0",
                    class_name: "Tất cả lớp học",
                    course_id: '0',
                    course_name: "khoá học"
                }
                if (data && data.length > 0) {
                    data.splice(0, 0, defaultClass);
                    setClasses(data);
                    setSelectedClass(defaultClass);

                }
                else {
                    setClasses(data);
                }
                console.log('data', data)


            } catch (error) {
                console.error("Error fetching:", error);
            }
        };
        fetchClass();
    }, []);

    return (
        <ClassContext.Provider value={{ selectedClass, setSelectedClass, classes, setClasses, loading }}>
            {children}
        </ClassContext.Provider>
    );
};

export const useClassContext = (): ClassContextType => {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error('useClassContext phải được sử dụng trong ClassProvider');
    }
    return context;
};
