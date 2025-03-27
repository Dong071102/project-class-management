export const ProductService = {
    getProductsData() {
        return [
            {
                _id: 'De068',
                species: 'Dê',
                barn: 'Chuong12D311',
                detectionDate: new Date('2021-12-12T00:00:00.000Z'),
                diseaseType: 'Nổi nhọt ở mông',
                entryDate: new Date('2021-12-12T00:00:00.000Z'),
                treatmentHistory: 'Bôi vaselin vào vùng ...',
                notes: 'Bôi vaselin vào ...',
                history: [
                    { date: new Date('2021-12-13T00:00:00.000Z'), content: "Bôi thuốc vào buổi sáng." },
                    { date: new Date('2021-12-14T00:00:00.000Z'), content: "Theo dõi vết thương, chưa có dấu hiệu nghiêm trọng." }
                ]
            },
            {
                _id: 'Cuu090',
                species: 'Cừu',
                barn: 'Chuong90C12',
                detectionDate: new Date('2021-12-12T00:00:00.000Z'),
                diseaseType: 'Thổ huyết',
                entryDate: new Date('2021-12-12T00:00:00.000Z'),
                treatmentHistory: 'Dùng thuốc cầm máu ...',
                notes: 'Bôi vaselin vào ...',
                history: [
                    { date: new Date('2021-12-13T00:00:00.000Z'), content: "Truyền dịch và theo dõi hô hấp." },
                    { date: new Date('2021-12-14T00:00:00.000Z'), content: "Tình trạng cải thiện, nhưng vẫn cần kiểm tra hàng ngày." }
                ]
            },
            {
                _id: 'De072',
                species: 'Dê',
                barn: 'Chuong12D320',
                detectionDate: new Date('2021-12-15T00:00:00.000Z'),
                diseaseType: 'Tiêu chảy',
                entryDate: new Date('2021-12-15T00:00:00.000Z'),
                treatmentHistory: 'Cho uống thuốc tiêu chảy',
                notes: 'Theo dõi sau 3 ngày',
                history: [
                    { date: new Date('2021-12-16T00:00:00.000Z'), content: "Bắt đầu cho uống thuốc tiêu chảy." },
                    { date: new Date('2021-12-17T00:00:00.000Z'), content: "Theo dõi phân, tình trạng có cải thiện." }
                ]
            }
        ];
    },

    getProductsMini() {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    },

    getProductsSmall() {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    },

    getProducts() {
        return Promise.resolve(this.getProductsData());
    }
};
