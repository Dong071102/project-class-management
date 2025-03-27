import React, { useState, useEffect, useRef,useContext } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2 ,FiChevronDown, FiChevronUp ,FiSearch, FiPlus} from "react-icons/fi";
import {AuthContext} from "../../../hooks/user"
import ImageUploader from '../../../components/image-upload/Image-Uploader';
import { FaTimesCircle, FaCircle, FaCheckCircle ,FaExclamationTriangle} from "react-icons/fa";
import { BiMessageSquareDetail } from "react-icons/bi";
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
interface Product {
    _id: string | null;
    name: string;
    description: string;
    categoryId:string;
    roomId:string;
    category:{_id:string;name:string};
    location:string;
    member_count:number;
    farm:string;
    start_date:Date;
    // records
    notified:boolean;
    status:string;
    room:{_id:string;name:string};
    images: { path: string; _id: string }[]; 
  }
    interface Room {
    _id: string;
    name: string;
}
interface Category {
    _id: string;
    name: string;
}
export default function OldHerds() {
const emptyProduct: Product = {
    _id: null,
    name: "",
    description: "",
    category: { _id: "", name: "" },
    categoryId: "",
    start_date:new Date(),
    roomId: "",
    location: "",
    member_count: 0,
    farm: "",
    notified: true,
    status: "",
    room: { _id: "", name: "" } ,
    images: [
        { path: "", _id: "" } 
    ]

};

    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [product, setProduct] = useState<Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [barns, setBarns] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Product[]>>(null);
    const {token}=useContext(AuthContext);
   
    useEffect(() => {
        const fetch = async () => {
          try {
            const response = await axios.get("https://agriculture-traceability.vercel.app/api/v1/herds");
            const data = response.data.herds;
            setProducts(data);
        } catch (error) {
            console.error("ERROR:", error);
        }
    };
    fetch();
}, []);
    useEffect(() => {
    const fetchBarns = async () => {
      try {
        const response = await fetch("https://agriculture-traceability.vercel.app/api/v1/rooms");
        const data = await response.json();
        setBarns(data.rooms);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    const fetchCategories = async () => {
        try {
          const response = await fetch("https://agriculture-traceability.vercel.app/api/v1/categories");
          const data = await response.json();
          setCategories(data.categories);
        } catch (error) {
          console.error("Error fetching:", error);
        }
      };
      fetchCategories();
    fetchBarns();
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

      if (product.name.trim()) {
          const _products = [...products];
          const _product = { ...product };

          if (product._id) {
              const index = findIndexById(product._id);
              _products[index] = _product;
              console.log( _products[index]);
              try {
                await axios.patch(
                    `https://agriculture-traceability.vercel.app/api/v1/herds/${product._id}`,
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
                    `https://agriculture-traceability.vercel.app/api/v1/herds/`,
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
            await axios.delete(`https://agriculture-traceability.vercel.app/api/v1/herds/${product._id}`, {
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
    
    const onRoomChange = (e: { value: string }) => {
        const selectedCat = barns.find((r) => r._id === e.value);
        setSelectedRoom(e.value);
        setProduct((prev) => ({
            ...prev,
            roomId: e.value,  
            room: selectedCat ? { _id: selectedCat._id, name: selectedCat.name } : prev.room, 
        }));
    };
    const onCategoryChange = (e: { value: string }) => {
        const selectedCat = categories.find((category) => category._id === e.value);
        setSelectedCategory(e.value);
        setProduct((prev) => ({
            ...prev,
            categoryId: e.value,  
            category: selectedCat ? { _id: selectedCat._id, name: selectedCat.name } : prev.category, 
        }));
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
    const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[name] = val;

        setProduct(_product);
    };
    const representativeBodyTemplate = (rowData:any) => {
        const representative = rowData.category;
    
        return (
          <div className="flex align-items-center gap-2">
            <span>{representative.name}</span>
          </div>
        );
      };
      const isProcessedBodyTemplate = (rowData: any) => {
        if (rowData.status === "Chưa thu hoạch") {
          return <FaTimesCircle className="text-red-500" />;
        } else if (rowData.status === "Đang thu hoạch") {
          return <FaCircle className="text-yellow-500" />;
        } else if (rowData.status === "Thu hoạch xong") {
          return <FaCheckCircle className="text-green-500" />;
        }
        return null;
      };
      //tinh tháng
      const calculateAgeInMonths = (startDate: string) => {
        const start = new Date(startDate);
        const now = new Date();
        const yearsDiff = now.getFullYear() - start.getFullYear();
        const monthsDiff = now.getMonth() - start.getMonth();
        return yearsDiff * 12 + monthsDiff;
      };
      
      const stockBodyTemplate = (rowData: any) => {
        const ageInMonths = calculateAgeInMonths(rowData.start_date);
        const stockClassName = classNames(
          "rounded-full  p-2 inline-flex font-bold justify-content-center align-items-center text-sm",
          {
            "bg-teal-100 text-teal-900": ageInMonths > 6,
          }
        );
        return <div className={stockClassName}>{ageInMonths}</div>;
      };
      const onRowDoubleClick = () => {
          for (const selectedProduct of selectedProducts) {
            navigate(`/herds/${selectedProduct._id}`);
          }
      };
    const actionBodyTemplate = (rowData: Product) => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18}  onClick={() => editProduct(rowData)} />
                <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteProduct(rowData)}  />
                <BiMessageSquareDetail className="text-[#76bc6a] cursor-pointer hover:text-green-500" size={19} onClick={onRowDoubleClick}  />
                </div>      
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                <h1 className="m-0 text-2xl">Đàn vật nuôi</h1>
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
                    <Column   field="name" header="Tên vật nuôi" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="member_count"  header="Số lượng" sortable  style={{ minWidth: "6rem" }} ></Column>
                    <Column field="status" header="Trạng thái" dataType="boolean" bodyClassName="text-center"style={{ minWidth: "5rem" }} body={isProcessedBodyTemplate} />
                    <Column field="location" sortable header="Chuồng" style={{ minWidth: "6rem" }}></Column>
                    <Column field="start_date" sortable header="Tháng tuổi" body={stockBodyTemplate} style={{ minWidth: "6rem" }}></Column>
                    <Column header="Nhóm" sortable sortField="category.name" filterField="category" style={{ minWidth: "14rem" }} body={representativeBodyTemplate} />
                    
                    <Column  header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Thông tin vật nuôi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="field ">
                        <label htmlFor="name" className="font-normal">Tên vật nuôi</label>
                        <InputText id="name" value={product.name}  onChange={(e) => onInputChange(e, 'name')}  required  autoFocus className={classNames({ 'p-invalid': submitted && !product.name })}
                        />
                        {submitted && !product.name && <small className="p-error">name is required.</small>}
                    </div>
                   
                    <div className="field ">
                        <label htmlFor="category" className="font-normal">Nhóm vật nuôi</label>
                        <Dropdown id="category" value={selectedCategory} options={categories}
                        onChange={onCategoryChange}  optionLabel="name" optionValue="_id"  placeholder="Chọn nhóm vật nuôi"
                        className={classNames({ "p-invalid": submitted && !selectedCategory })}
                        />
                        {submitted && !product.category && <small className="p-error">category is required.</small>}
                    </div>
                    
                    <div className="field ">
                        <label htmlFor="location" className="font-normal">Vị trí chuồng</label>
                        <InputText id="location" value={product.location}  onChange={(e) => onInputChange(e, 'location')}  required  autoFocus className={classNames({ 'p-invalid': submitted && !product.location })}
                        />
                    </div>
                    <div className="field ">
                        <label htmlFor="room" className="font-normal">Chuồng</label>
                        <Dropdown id="room" value={selectedRoom} options={barns}
                        onChange={onRoomChange}  optionLabel="name" optionValue="_id"  placeholder="Chọn chuồng"
                        className={classNames({ "p-invalid": submitted && !selectedRoom })}
                        />
                        {submitted && !product.room && <small className="p-error">room is required.</small>}
                    </div>
                    
                  </div>
                  <div className="field mt-3">
                        <label htmlFor="description" className="font-normal">Mô tả</label>
                        <InputTextarea id="description" value={product.description} onChange={(e:React.ChangeEvent<HTMLTextAreaElement>) => onInputTextAreaChange(e, 'description')} required rows={5} cols={20} />
                        {submitted && !product.description && <small className="p-error">description is required.</small>}
                    </div>
                  {product._id && (
                        <div className="mt-3">
                            <label htmlFor="description" className="font-normal">Hình ảnh</label>
                            <ImageUploader
                            uploadUrl={`https://agriculture-traceability.vercel.app/api/v1/herds/upload/${product._id}`}
                            images={product.images?.map(img => ({ path: img.path, _id: img._id }))}
                            />
                        </div>
                    )}
                       

            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content flex item-center ">
                    <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span className="mt-3">
                           Bạn có chắc chắn muốn xóa <b>{product.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}
         