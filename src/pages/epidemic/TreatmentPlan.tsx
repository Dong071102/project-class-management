

    
import React, { useState, useEffect, useRef,useContext } from 'react';
import axios from "axios";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FiEdit, FiTrash2 ,FiChevronDown, FiChevronUp ,FiSearch, FiPlus} from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { ProductService } from './data1';
import {AuthContext} from "../../hooks/user"
interface Product {
  _id: string | null;
  diseaseName:string;
  species: string;
  symptom: string;
  transmission: string;
  prevention: string;
  medicine: string;

  dosage: string;
  usageTime: string;
  usageStage: string;
  responsiblePerson: string;

}


export default function TreatmentPlan() {
  const emptyProduct: Product = {
    _id: null,
    diseaseName:"",
    species: "",
    symptom: "", 
    transmission: "", 
    prevention: "", 
    medicine: "", 

    dosage: "", 
    usageTime: "", 
    usageStage: "", 
    responsiblePerson: "", 
  };
  

    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [product, setProduct] = useState<Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const {token}=useContext(AuthContext);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Product[]>>(null);
    useEffect(() => {
    //     const fetch = async () => {
    //       try {
    //         const response = await axios.get("https://agriculture-traceability.vercel.app/api/v1/resources");
    //         const data = response.data.resources;
    //         setProducts(data);
    //         console.log(products);
    //     } catch (error) {
    //         console.error("ERROR:", error);
    //     }
    // };
    // fetch();
    ProductService.getProducts().then((data) => setProducts(data));
  }, []);
  const usageStageOptions = [
    { label: 'Đầu', value: 'Đầu' },
    { label: 'Giữa', value: 'Giữa' },
    { label: 'Cuối', value: 'Cuối' }
  ];

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

      if (product.species.trim()) {
          const _products = [...products];
          const _product = { ...product };

          if (product._id) {
              const index = findIndexById(product._id);
              _products[index] = _product;
              console.log( _products[index]);
              try {
                await axios.patch(
                    `https://agriculture-traceability.vercel.app/api/v1/resources/${product._id}`,
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
                    `https://agriculture-traceability.vercel.app/api/v1/resources/`,
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
            await axios.delete(`https://agriculture-traceability.vercel.app/api/v1/resources/${product._id}`, {
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
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement> | { value: any }, field: string) => {
      const val = 'value' in e ? e.value : e.target.value; // Kiểm tra nếu là Dropdown thì lấy e.value, nếu là InputText thì lấy e.target.value
      setProduct((prev) => ({ ...prev, [field]: val }));
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
                <h1 className="m-0 text-2xl">Thức ăn</h1>
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
                    <Column   field="diseaseName" header="Tên bệnh" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column   field="species" header="Giống loài" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column  field="symptom"  header="Dấu hiệu"  sortable style={{ minWidth: '4rem' }}></Column>
                    <Column   field="transmission" header="Nguyên nhân lây lan" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column   field="prevention" header="Biện pháp phòng ngừa" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column  field="medicine"  header="Thuốc" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column  field="dosage"  header="Liều lượng"  sortable style={{ minWidth: '4rem' }}></Column>
                    <Column   field="usageTime" header="Thời gian dùng" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column   field="usageStage" header="Giai đoạn sử dụng" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column  field="responsiblePerson"  header="Người phụ trách" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column  header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Hồ sơ theo dõi" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Lịch sử điều trị </p>
                <div className="flex  flex-col md:flex-row  gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="field ">
                      <label htmlFor="diseaseName" className="font-normal">
                          Tên bệnh
                      </label>
                      <InputText id="diseaseName" value={product.diseaseName} onChange={(e) => onInputChange(e, 'diseaseName')}   />
                    </div>
                    <div className="field ">
                      <label htmlFor="transmission" className="font-normal">
                          Nguyên nhân lây lan
                      </label>
                      <InputText id="transmission" value={product.transmission} onChange={(e) => onInputChange(e, 'transmission')}   />
                    </div>
                    <div className="field ">
                      <label htmlFor="medicine" className="font-normal">
                          Thuốc
                      </label>
                      <InputText id="medicine" value={product.medicine} onChange={(e) => onInputChange(e, 'medicine')}   />
                    </div>
                    <div className="field ">
                        <label htmlFor="usageStage" className="font-normal">
                              Giai đoạn sử dụng
                          </label>
                        <Dropdown
                        id="usageStage"
                        value={product.usageStage}
                        options={usageStageOptions}
                        onChange={(e) => onInputChange(e, 'usageStage')}
                        placeholder="Chọn giai đoạn"
                      />
                    </div>
                    <div className="field ">
                      <label htmlFor="responsiblePerson" className="font-normal">
                          Người phụ trách
                      </label>
                      <InputText id="responsiblePerson" value={product.responsiblePerson} onChange={(e) => onInputChange(e, 'responsiblePerson')}   />
                    </div>
                  </div>
                  {/* phải */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="field ">
                        <label htmlFor="species" className="font-normal">Giống loài</label>
                        <InputText id="species" value={product.species}  onChange={(e) => onInputChange(e, 'species')}  required  autoFocus className={classNames({ 'p-invalid': submitted && !product.species })}
                        />
                        {submitted && !product.species && <small className="p-error">species is required.</small>}
                    </div>
                    <div className="field ">
                      <label htmlFor="prevention" className="font-normal">
                        Biện pháp phòng ngừa
                      </label>
                      <InputText id="prevention" value={product.prevention} onChange={(e) => onInputChange(e, 'prevention')}   />
                    </div>
                    <div className="field ">
                      <label htmlFor="dosage" className="font-normal">
                       Liều lượng
                      </label>
                      <InputText id="dosage" value={product.dosage} onChange={(e) => onInputChange(e, 'dosage')}   />
                    </div>
                    <div className="field ">
                      <label htmlFor="usageTime" className="font-normal">
                        Thời gian sử dụng
                      </label>
                      <InputText id="usageTime" value={product.usageTime} onChange={(e) => onInputChange(e, 'usageTime')}   />
                    </div>
                  </div>

                </div>
               
            </Dialog>
            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content flex item-center ">
                    <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span className="mt-3">
                           Bạn có chắc chắn muốn xóa <b>{product.species}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

        </div>
    );
}
         