// import React, { useState, useEffect, useRef,useContext } from 'react';
// import axios from "axios";
// import { classNames } from 'primereact/utils';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Toast } from 'primereact/toast';
// import { Button } from 'primereact/button';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
// import { FiEdit, FiTrash2 ,FiChevronDown, FiChevronUp ,FiSearch, FiPlus} from "react-icons/fi";
// import { FaExclamationTriangle } from "react-icons/fa";
// import { MdCameraOutdoor } from "react-icons/md";
// import { Dropdown } from "primereact/dropdown"; 
// import {AuthContext} from "../../hooks/user"
// interface Product {
//     _id: string | null;
//     room: {
//       name: string;
//     };
//     cameraId: string;
//   }
//   interface Room {
//     _id: string;
//     name: string;
// }


// export default function Herds() {
//     const emptyProduct: Product = {
//        _id: null,
//        room: {
//         name: '',
//       },
//        cameraId: '',
//     };

//     const [products, setProducts] = useState<Product[]>([]);
//     const [productDialog, setProductDialog] = useState<boolean>(false);
//     const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
//     const [product, setProduct] = useState<Product>(emptyProduct);
//     const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
//     const [submitted, setSubmitted] = useState<boolean>(false);
//     const [globalFilter, setGlobalFilter] = useState<string>('');
//     const [barns, setBarns] = useState<Room[]>([]);
//     const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
//     const { token } = useContext(AuthContext);

//     const toast = useRef<Toast>(null);
//     const dt = useRef<DataTable<Product[]>>(null);
//     useEffect(() => {
//         const fetchShelters = async () => {
//           try {
//             const response = await fetch("https://agriculture-traceability.vercel.app/api/v1/shelters");
//             const data = await response.json();
//             setProducts(data.shelters);
//             console.log(data)
//         } catch (error) {
//             console.error("ERROR:", error);
//         }
//     };
//     fetchShelters();
// }, []);

//     useEffect(() => {
//     const fetchBarns = async () => {
//       try {
//         const response = await fetch("https://agriculture-traceability.vercel.app/api/v1/rooms");
//         const data = await response.json();
//         setBarns(data.rooms);
//       } catch (error) {
//         console.error("Error fetching:", error);
//       }
//     };
//     fetchBarns();
//   }, []);
//     const onRoomChange = (e: { value: string }) => {
//         const selectedBarn = barns.find((barn) => barn._id === e.value);

//         setSelectedRoom(e.value);
//         setProduct((prev) => ({
//             ...prev,
//             room: {
//                 _id: e.value,
//                 name: selectedBarn ? selectedBarn.name : "", 
//             },
//         }));
//     };

    
//     const openNew = () => {
//         setProduct(emptyProduct);
//         setSubmitted(false);
//         setProductDialog(true);
//     };

//     const hideDialog = () => {
//         setSubmitted(false);
//         setProductDialog(false);
//     };

//     const hideDeleteProductDialog = () => {
//         setDeleteProductDialog(false);
//     };
   
//     const saveProduct = async () => {
//         setSubmitted(true);
    
//         if (product.cameraId.trim() && selectedRoom) {
//             const selectedBarn = barns.find((barn) => barn._id === selectedRoom);
//             const roomName = selectedBarn ? selectedBarn.name : "";
    
//             const _products = [...products];
//             const _product = { ...product, room: { _id: selectedRoom, name: roomName } };
    
//             if (product._id) {
//                 const index = findIndexById(product._id);
//                 _products[index] = _product;
    
//                 try {
//                     await axios.patch(
//                         `https://agriculture-traceability.vercel.app/api/v1/shelters/${product._id}`,
//                         _products[index],
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     );
//                     toast.current?.show({
//                         severity: "success",
//                         summary: "Successful",
//                         detail: "Chỉnh sửa thành công",
//                         life: 3000,
//                     });
//                 } catch (error) {
//                     console.error("Error:", error);
//                     toast.current?.show({
//                         severity: "error",
//                         summary: "Error",
//                         detail: "Chỉnh sửa thất bại",
//                         life: 3000,
//                     });
//                 }
//             } else {
//                 try {
//                     await axios.post(
//                         `https://agriculture-traceability.vercel.app/api/v1/shelters/`,
//                         _product,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     );
//                     toast.current?.show({
//                         severity: "success",
//                         summary: "Successful",
//                         detail: "Tạo thành công",
//                         life: 3000,
//                     });
//                 } catch (error) {
//                     console.error("Error:", error);
//                     toast.current?.show({
//                         severity: "error",
//                         summary: "Error",
//                         detail: "Tạo thất bại",
//                         life: 3000,
//                     });
//                 }
//                 _products.push(_product);
//             }
    
//             setProducts(_products);
//             setProductDialog(false);
//             setProduct(emptyProduct);
//             setSelectedRoom(null);
//         }
//     };
    

//     const editProduct = (product: Product) => {
//         setProduct({ ...product });
//         setProductDialog(true);
//     };

//     const confirmDeleteProduct = (product: Product) => {
//         setProduct(product);
//         setDeleteProductDialog(true);
//     };
//     const deleteProduct = async () => {
//         try {
//             await axios.delete(`https://agriculture-traceability.vercel.app/api/v1/shelters/${product._id}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             const _products = products.filter((val) => val._id !== product._id);
//             setProducts(_products);
//             setDeleteProductDialog(false);
//             setProduct(emptyProduct);
//              toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });

//         } catch (error) {
//             console.error("Error:", error);
//             toast.current?.show({  severity: 'error', summary: 'Error',  detail: 'Xóa thất bại',  life: 3000  });
//         }
//     };
    

//     const findIndexById = (_id: string) => {
//         let index = -1;
//         for (let i = 0; i < products.length; i++) {
//             if (products[i]._id === _id) {
//                 index = i;
//                 break;
//             }
//         }
//         return index;
//     };
//     const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, cameraId: string) => {
//         const val = (e.target && e.target.value) || '';
//         const _product = { ...product };

//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         _product[cameraId] = val;
//         setProduct(_product);
//     };
//     const cameraBodyTemplate = (rowData: Product) => {
//         return (
//             <div className="flex justify-center cursor-pointer gap-1 bg-[#3D6649] text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
//                 <MdCameraOutdoor className="text-white" size={18} />
//                 <p className="" > {rowData.cameraId} </p>
//           </div>
//         )
//     };
//     const actionBodyTemplate = (rowData: Product) => {
//         return (
//             <React.Fragment>
//                 <div className="flex flex-wrap gap-2">
//                 <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18}  onClick={() => editProduct(rowData)} />
//                 <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteProduct(rowData)}  />
//                 </div>      
//             </React.Fragment>
//         );
//     };

//     const header = (
//         <div className="flex flex-wrap lign-items-center justify-between">
//             <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
//                 <h1 className="m-0 text-2xl">Đàn</h1>
//                 <div className="flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
//                     <FiSearch  className="text-[#278D45] w-5 h-5" />
//                     <input  type="search" onInput={(e) => {const target = e.target as HTMLInputElement; setGlobalFilter(target.value);}} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none"/>
//                     <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
//                 </div>
//             </div>
            
//             <div onClick={openNew} className="flex gap-1 p-2 rounded-full items-center justify-between text-white bg-[#76BC6A] cursor-pointer hover:bg-green-600" >
//                 <FiPlus size={18} />
//                 <p className="text-base font-normal">Thêm mới</p>
//             </div>
//         </div>
//     );
//     const productDialogFooter = (
//         <React.Fragment>
//             <Button label="Thoát" outlined onClick={hideDialog} rounded />
//             <Button label="Lưu Thay Đổi"  onClick={saveProduct} rounded />
//         </React.Fragment>
//     );
//     const deleteProductDialogFooter = (
//         <React.Fragment>
//             <Button label="Không" outlined onClick={hideDeleteProductDialog} rounded />
//             <Button label="Có" severity="danger" onClick={deleteProduct} rounded/>
//         </React.Fragment>
//     );
    
    
//     return (
//         <div>
//             <Toast ref={toast} />
//             <div >

//             <DataTable className="p-2 bg-[#F3F7F5] rounded-[20px]" ref={dt} value={products} selection={selectedProducts} 
//                         onSelectionChange={(e) => {
//                             if (Array.isArray(e.value)) {
//                                 setSelectedProducts(e.value);
//                             }
//                         }}
//                         sortIcon={(options) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />}
//                         dataKey="_id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
//                         paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
//                         globalFilter={globalFilter} header={header}
//                         selectionMode="multiple" scrollable scrollHeight='100vh' virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
//                     <Column  selectionMode="multiple" exportable={false}></Column>
//                     <Column   field="room.name" header="Chuồng" sortable style={{ minWidth: '1rem' }}></Column>
//                     <Column  field="cameraId" body={cameraBodyTemplate} header="Camera theo dõi"  style={{ minWidth: '4rem' }}></Column>
//                     <Column  header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
//                 </DataTable>
//             </div>

//             <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
//                 <p className="mb-4 text-black">Thông tin đàn</p>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
//                     <div className="field">
//                         <label htmlFor="room" className="font-normal">
//                             Chuồng
//                         </label>
//                         <Dropdown id="room" value={selectedRoom} options={barns}
//                         onChange={onRoomChange}  optionLabel="name" optionValue="_id"  placeholder="Chọn chuồng"
//                         className={classNames({ "p-invalid": submitted && !selectedRoom })}
//                         />
//                         {submitted && !product.room && <small className="p-error">room is required.</small>}
//                     </div>

//                     <div className="field ">
//                         <label htmlFor="cameraId" className="font-normal">Camera</label>
//                         <InputText id="cameraId" value={product.cameraId}  onChange={(e) => onInputChange(e, 'cameraId')}  required  autoFocus className={classNames({ 'p-invalid': submitted && !product.cameraId })}
//                         />
//                         {submitted && !product.cameraId && <small className="p-error">cameraId is required.</small>}
//                     </div>
//                 </div>

//             </Dialog>

//             <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
//                 <div className="confirmation-content flex item-center ">
//                     <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
//                     {product && (
//                         <span className="mt-3">
//                            Bạn có chắc chắn muốn xóa <b>{product.cameraId}</b>?
//                         </span>
//                     )}
//                 </div>
//             </Dialog>
//         </div>
//     );
// }
         

import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProductService } from './data';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber,InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2 ,FiChevronDown, FiChevronUp ,FiSearch, FiPlus} from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { Calendar } from 'primereact/calendar';
import { MdCameraOutdoor } from "react-icons/md";
interface Product {
  id: string | null;
  species: string;
  herd: string;
  barn: string;
  entryDate: string ;
  totalQuantity: number;
  exitDate: string ;
  sickQuantity: number;
  cameraMonitoring: string;
}

export default function ProductsDemo() {
    const emptyProduct: Product = {
       id: null,
       species: '',
       herd: '',
       entryDate: "",
       barn: '',
       exitDate: "",
       totalQuantity: 0,
       sickQuantity: 0,
       cameraMonitoring: "",
    };

    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [product, setProduct] = useState<Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Product[]>>(null);

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);
    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };
   
    const saveProduct = () => {
        setSubmitted(true);

        if (product.herd.trim()) {
            const _products = [...products];
            const _product = { ...product };

            if (product.id) {
                const index = findIndexById(product.id);

                _products[index] = _product;
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 });
            } else {
                _product.id = createId();
                _products.push(_product);
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tạo thành công', life: 3000 });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const editProduct = (product: Product) => {
        setProduct({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: Product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        const _products = products.filter((val) => val.id !== product.id);

        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const createId = (): string => {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, herd: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
    };

     const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, herd: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, herd: string) => {
        const val = e.value ?? 0;
        const _product = { ...product };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
    };
    const cameraBodyTemplate = (rowData: Product) => {
        return (
            <div className="flex  cursor-pointer gap-1 bg-[#3D6649] text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
                <MdCameraOutdoor className="text-white" size={18} />
                <p className="" > {rowData.cameraMonitoring} </p>
          </div>
        )
    };
    const actionBodyTemplate = (rowData: Product) => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18}  onClick={() => editProduct(rowData)} />
                <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteProduct(rowData)}  />
                </div>      
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                <h1 className="m-0 text-2xl">Đàn</h1>
                <div className="flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                    <FiSearch  className="text-[#278D45] w-5 h-5" />
                    <input  type="search" onInput={(e) => {const target = e.target as HTMLInputElement; setGlobalFilter(target.value);}} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none"/>
                    <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
                </div>
            </div>
            
            <div onClick={openNew} className="flex gap-1 p-2 rounded-full items-center justify-between text-white bg-[#76BC6A] cursor-pointer hover:bg-green-600" >
                <FiPlus size={18} />
                <p className="text-base font-normal">Thêm mới</p>
            </div>
        </div>
    );
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Thoát" outlined onClick={hideDialog} rounded />
            <Button label="Lưu Thay Đổi"  onClick={saveProduct} rounded />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="Không" outlined onClick={hideDeleteProductDialog} rounded />
            <Button label="Có" severity="danger" onClick={deleteProduct} rounded/>
        </React.Fragment>
    );
    
    return (
        <div>
            <Toast ref={toast} />
            <div >

            <DataTable className="p-2 bg-[#F3F7F5] rounded-[20px]" ref={dt} value={products} selection={selectedProducts} 
                        onSelectionChange={(e) => {
                            if (Array.isArray(e.value)) {
                                setSelectedProducts(e.value);
                            }
                        }}
                        sortIcon={(options) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />}
                        dataKey="id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                        globalFilter={globalFilter} header={header}
                        selectionMode="multiple" scrollable scrollHeight='100vh' virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
                    <Column  selectionMode="multiple" exportable={false}></Column>
                    <Column  field="species" header="Giống loài" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column  field="herd" header="Đàn" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column  field="barn" header="Chuồng" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column  field="entryDate" header="Ngày nhập chuồng" sortable ></Column>
                    <Column  field="exitDate" header="Ngày xuất chuồng" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column  field="totalQuantity" header="Tổng số lượng" sortable style={{ minWidth: '4rem' }}></Column>
                    {/* <Column   field="sickQuantity" header="Số lượng bệnh" headerStyle={{ color: '#F14871' }} */}
                      {/* bodyStyle={{ color: '#F14871' }}   headerClassName="custom-sort-icon" sortable  style={{ minWidth: '4rem' }} /> */}
                    <Column  field="cameraMonitoring" body={cameraBodyTemplate} header="Camera theo dõi"  style={{ minWidth: '4rem' }}></Column>
                    <Column  header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Thông tin đàn</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="field">
                        <label htmlFor="species" className="font-normal">
                            Giống loài
                        </label>
                        <InputText id="species" value={product.species}  onChange={(e) => onInputChange(e, 'species')} required
                            autoFocus className={classNames({ 'p-invalid': submitted && !product.species })}
                        />
                        {submitted && !product.species && <small className="p-error">species is required.</small>}
                    </div>

                    <div className="field ">
                        <label htmlFor="herd" className="font-normal">  Đàn </label>
                        <InputText id="herd" value={product.herd}  onChange={(e) => onInputChange(e, 'herd')}  required  autoFocus className={classNames({ 'p-invalid': submitted && !product.herd })}
                        />
                        {submitted && !product.herd && <small className="p-error">herd is required.</small>}
                    </div>

                    <div className="field ">
                    <label htmlFor="barn" className="font-normal">
                       Chuồng
                    </label>
                     <InputText id="barn" value={product.barn} onChange={(e) => onInputChange(e, 'barn')} required />
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="field">
                        <label htmlFor="entryDate" className="font-normal">Ngày nhập chuồng</label>
                        <Calendar id="entryDate"  showIcon
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="exitDate" className="font-normal">Ngày xuất chuồng</label>
                        <Calendar  id="exitDate"  showIcon
                        />
                    </div>
                    <div className="field ">
                    <label htmlFor="totalQuantity" className="font-normal">
                        Tổng số lượng
                    </label>
                    <InputNumber id="totalQuantity" value={product.totalQuantity} onValueChange={(e) => onInputNumberChange(e, 'totalQuantity')} showButtons  />
                    </div>
                    <div className="field ">
                        <label htmlFor="sickQuantity" className="font-normal">
                            Số lượng bệnh
                        </label>
                        <InputNumber id="sickQuantity" value={product.sickQuantity} onValueChange={(e) => onInputNumberChange(e, 'sickQuantity')} showButtons />
                    </div>
                </div>
                <div className="field ">
                        <label htmlFor="sickQuantity" className="font-normal">
                            Ghi chú
                        </label>
                        <InputTextarea id="sickQuantity" value={product.barn} onChange={(e) => onInputTextAreaChange(e, 'barn')} rows={4}/>
                    </div>
            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content flex item-center ">
                    <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span className="mt-3">
                           Bạn có chắc chắn muốn xóa <b>{product.herd}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
         