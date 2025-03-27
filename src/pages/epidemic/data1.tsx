export const ProductService = {
    getProductsData() {
        return [
            {
                _id: 'SR001',
                diseaseName: 'Sởi',
                species: 'Cừu',
                symptom: 'Nổi nhọt ở chi',
                transmission: 'Qua thức ăn',
                prevention: 'Cho cách ly, cho bú riêng',
                medicine: 'Thuốc abc',
                dosage: '2ml',
                usageTime: 'Sau ăn',
                usageStage: 'Đầu',
                responsiblePerson: 'Chuyên gia A'
            },
            {
                _id: 'CH002',
                diseaseName: 'Chướng',
                species: 'Dê',
                symptom: 'Bỏ bữa',
                transmission: 'Qua thức ăn',
                prevention: 'Cho cách ly, cho bú riêng',
                medicine: 'Thuốc abc',
                dosage: '2ml',
                usageTime: 'Sau ăn',
                usageStage: 'Giữa',
                responsiblePerson: 'Chuyên gia A'
            },
            {
                _id: 'BA003',
                diseaseName: 'Biến ăn',
                species: 'Cừu',
                symptom: 'Bỏ bữa',
                transmission: 'Qua thức ăn',
                prevention: 'Cho cách ly, cho bú riêng',
                medicine: 'Thuốc abc',
                dosage: '2ml',
                usageTime: 'Sau ăn',
                usageStage: 'Cuối',
                responsiblePerson: 'Chuyên gia A'
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
