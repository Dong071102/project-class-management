import React, { useState, useEffect, useRef,useContext } from 'react';
import axios from "axios";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2 ,FiChevronDown, FiChevronUp ,FiSearch, FiPlus} from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import {AuthContext} from "../../../hooks/user"

interface Product {
    _id: string|null;
    herd: {
    _id: string;
    name: string;
    };
    type: string;
    product: string;
    amount: string;
    mode: string;
    description: string;
    date: string;
    retreat_date: string;
    site: string;
    technician: string;
    
  }
  
export default function Treatments() {
const emptyProduct: Product = {
    _id: null,
    herd: {
        _id: "",
        name: ""
    },
    type: "",
    product: "",
    amount: "",
    mode: "",
    description: "",
    date: "",
    retreat_date: "",
    site: "",
    technician: ""
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
    const {token}=useContext(AuthContext);
   
    useEffect(() => {
        const fetch = async () => {
          try {
            const response = await axios.get("https://agriculture-traceability.vercel.app/api/v1/treatments");
            const data = response.data.treatments;
            setProducts(data);
            console.log(products);
        } catch (error) {
            console.error("ERROR:", error);
        }
    };
    fetch();
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
   
    const saveProduct = async() => {
      setSubmitted(true);

      if (product.type.trim()) {
          const _products = [...products];
          const _product = { ...product };

          if (product._id) {
              const index = findIndexById(product._id);
              _products[index] = _product;
              console.log( _products[index]);
              try {
                await axios.patch(
                    `https://agriculture-traceability.vercel.app/api/v1/treatments/${product._id}`,
                    _products[index],
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current?.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Chỉnh sửa thành công",
                    life: 3000,
                });
            } catch (error) {
                console.error("Error:", error);
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Chỉnh sửa thất bại",
                    life: 3000,
                });
            }
          } else {
              _products.push(_product);
              console.log("tc",_product)

              try {
                await axios.post(
                    `https://agriculture-traceability.vercel.app/api/v1/treatments/`,
                    _product,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tạo thành công', life: 3000 });
            } catch (error) {
                console.error("Error:", error);
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Tạo thất bại",
                    life: 3000,
                });
            }
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
    const deleteProduct = async () => {
        try {
            await axios.delete(`https://agriculture-traceability.vercel.app/api/v1/treatments/${product._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const _products = products.filter((val) => val._id !== product._id);
            setProducts(_products);
            setDeleteProductDialog(false);
            setProduct(emptyProduct);
             toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });

        } catch (error) {
            console.error("Error:", error);
            toast.current?.show({  severity: 'error', summary: 'Error',  detail: 'Xóa thất bại',  life: 3000  });
        }
    };
    

    const findIndexById = (_id: string) => {
        let index = -1;
        for (let i = 0; i < products.length; i++) {
            if (products[i]._id === _id) {
                index = i;
                break;
            }
        }
        return index;
    };
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, herd: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
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
                <h1 className="m-0 text-2xl">Quản lý bệnh</h1>
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
                        dataKey="_id"  paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                        globalFilter={globalFilter} header={header}
                        selectionMode="multiple" scrollable scrollHeight='100vh' virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
                    <Column  selectionMode="multiple" exportable={false}></Column>
                    <Column field="product" header="Tên sản phẩm" sortable style={{ minWidth: '1rem' }} />
                    <Column field="description" header="Mô tả" sortable style={{ minWidth: '1rem' }} />
                    <Column field="type" header="Loại" sortable style={{ minWidth: '1rem' }} />
                    <Column field="amount" header="Liều lượng" sortable style={{ minWidth: '1rem' }} />
                    <Column field="mode" header="Phương thức" sortable style={{ minWidth: '1rem' }} />
                    <Column field="site" header="Vị trí tiêm" sortable style={{ minWidth: '1rem' }} />
                    <Column field="technician" header="Kỹ thuật viên" sortable style={{ minWidth: '1rem' }} />
                    <Column field="date" header="Ngày tiêm" style={{ minWidth: "5rem" }}  
                        body={(rowData) => rowData.date ? new Date(rowData.date).toLocaleDateString() : "Chưa có"} />
                    <Column field="retreat_date" header="Ngày nhắc lại" style={{ minWidth: "5rem" }}  
                        body={(rowData) => rowData.retreat_date ? new Date(rowData.retreat_date).toLocaleDateString() : "Chưa có"} />
                    <Column field="herd.name" header="Tên đàn" sortable style={{ minWidth: '1rem' }} />

                    <Column  header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Thông tin nhóm</p>
                <div className="grid grid-cols-2 gap-4">
            {/* Cột 1 */}
            <div className="flex flex-col gap-3">
                <div className="field">
                    <label htmlFor="product" className="font-normal">Tên sản phẩm</label>
                    <InputText id="product" value={product.product} onChange={(e) => onInputChange(e, 'product')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.product })} />
                    {submitted && !product.product && <small className="p-error">Tên sản phẩm là bắt buộc.</small>}
                </div>
                <div className="field">
                    <label htmlFor="type" className="font-normal">Loại</label>
                    <InputText id="type" value={product.type} onChange={(e) => onInputChange(e, 'type')} required className={classNames({ 'p-invalid': submitted && !product.type })} />
                    {submitted && !product.type && <small className="p-error">Loại là bắt buộc.</small>}
                </div>
                <div className="field">
                    <label htmlFor="amount" className="font-normal">Liều lượng</label>
                    <InputText id="amount" value={product.amount} onChange={(e) => onInputChange(e, 'amount')} required className={classNames({ 'p-invalid': submitted && !product.amount })} />
                </div>
                <div className="field">
                    <label htmlFor="mode" className="font-normal">Phương thức</label>
                    <InputText id="mode" value={product.mode} onChange={(e) => onInputChange(e, 'mode')} required className={classNames({ 'p-invalid': submitted && !product.mode })} />
                </div>
            </div>

            {/* Cột 2 */}
            <div className="flex flex-col gap-3">
                <div className="field">
                    <label htmlFor="description" className="font-normal">Mô tả</label>
                    <InputText id="description" value={product.description} onChange={(e) => onInputChange(e, 'description')} required className={classNames({ 'p-invalid': submitted && !product.description })} />
                    {submitted && !product.description && <small className="p-error">Mô tả là bắt buộc.</small>}
                </div>
                <div className="field">
                    <label htmlFor="site" className="font-normal">Vị trí tiêm</label>
                    <InputText id="site" value={product.site} onChange={(e) => onInputChange(e, 'site')} required className={classNames({ 'p-invalid': submitted && !product.site })} />
                </div>
                <div className="field">
                    <label htmlFor="technician" className="font-normal">Kỹ thuật viên</label>
                    <InputText id="technician" value={product.technician} onChange={(e) => onInputChange(e, 'technician')} required className={classNames({ 'p-invalid': submitted && !product.technician })} />
                </div>
            </div>
        </div>
                       

            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content flex item-center ">
                    <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span className="mt-3">
                           Bạn có chắc chắn muốn xóa <b>{product.type}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
         