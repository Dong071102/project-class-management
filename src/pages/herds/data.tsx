export const ProductService = {
    getProductsData() {
        return [
                {
                  id: '2000',
                  species: 'Dê',
                  herd: 'De068dan12',
                  barn: 'Chuong12D311',
                  entryDate: '12.12.2021',
                  exitDate: '12.06.2022',
                  totalQuantity: 1200120,
                  sickQuantity: 234,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2001',
                  species: 'Cừu',
                  herd: 'Cuu090dan2',
                  barn: 'Chuong90C12',
                  entryDate: '12.12.2022',
                  exitDate: '12.06.2023',
                  totalQuantity: 6060606,
                  sickQuantity: 12,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2002',
                  species: 'Cừu',
                  herd: 'Cuu090dan2',
                  barn: 'Chuong90C12',
                  entryDate: '12.12.2022',
                  exitDate: '10.05.2023',
                  totalQuantity: 6060606,
                  sickQuantity: 606,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2003',
                  species: 'Dê',
                  herd: 'De068dan12',
                  barn: 'Chuong12D311',
                  entryDate: '12.12.2021',
                  exitDate: '05.07.2022',
                  totalQuantity: 1200120,
                  sickQuantity: 120,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2004',
                  species: 'Cừu',
                  herd: 'Cuu090dan2',
                  barn: 'Chuong90C12',
                  entryDate: '12.12.2022',
                  exitDate: '15.08.2023',
                  totalQuantity: 6060606,
                  sickQuantity: 6060606,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2005',
                  species: 'Bò',
                  herd: 'Bo200dan4',
                  barn: 'Chuong20B12',
                  entryDate: '01.01.2023',
                  exitDate: '10.07.2023',
                  totalQuantity: 500500,
                  sickQuantity: 25,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2006',
                  species: 'Dê',
                  herd: 'De300dan7',
                  barn: 'Chuong30D14',
                  entryDate: '20.03.2023',
                  exitDate: '20.09.2023',
                  totalQuantity: 700700,
                  sickQuantity: 50,
                  cameraMonitoring: "Camera"
                },
                {
                  id: '2007',
                  species: 'Cừu',
                  herd: 'Cuu400dan8',
                  barn: 'Chuong40C16',
                  entryDate: '15.05.2023',
                  exitDate: '30.11.2023',
                  totalQuantity: 800800,
                  sickQuantity: 80,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2008',
                  species: 'Bò',
                  herd: 'Bo500dan10',
                  barn: 'Chuong50B20',
                  entryDate: '10.07.2023',
                  exitDate: '15.01.2024',
                  totalQuantity: 900900,
                  sickQuantity: 90,
                  cameraMonitoring: 'Camera'
                },
                {
                  id: '2009',
                  species: 'Dê',
                  herd: 'De600dan12',
                  barn: 'Chuong60D22',
                  entryDate: '01.09.2023',
                  exitDate: '20.03.2024',
                  totalQuantity: 10001000,
                  sickQuantity: 100,
                  cameraMonitoring: 'Camera'
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
    },
};
