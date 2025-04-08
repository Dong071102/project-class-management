import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from "axios";
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiSearch, FiPlus } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { Calendar } from 'primereact/calendar';
import { ProductService } from './data';
import { AuthContext } from "../../hooks/user"
import TreatmentHistoryPopup from '../../components/treatment-history-Popup/TreatmentHistoryPopup';
interface Product {
    _id: string | null;
    species: string;
    barn: string;
    detectionDate: Date;
    diseaseType: string;
    entryDate: Date;
    treatmentHistory: string;
    notes: string;

}


export default function TrackRecord() {
    const emptyProduct: Product = {
        _id: null,
        species: "",
        barn: "",
        detectionDate: new Date(),
        diseaseType: "",
        entryDate: new Date(),
        treatmentHistory: "",
        notes: "",

    };


    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [product, setProduct] = useState<Product>(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    // const { token } = useContext(AuthContext);

    /*eslint-disable @typescript-eslint/no-explicit-any*/
    const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const handleOpenPopup = (rowData: any) => {
        setSelectedTreatment(rowData);
    };

    const handleClosePopup = () => {
        setSelectedTreatment(null);
    };

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

    const saveProduct = async () => {
        setSubmitted(true);

        if (product.species.trim()) {
            const _products = [...products];
            const _product = { ...product };

            if (product._id) {
                const index = findIndexById(product._id);
                _products[index] = _product;
                console.log(_products[index]);
                try {
                    await axios.patch(
                        `https://agriculture-traceability.vercel.app/api/v1/resources/${product._id}`,
                        _products[index],
                        {
                            headers: {
                                // Authorization: `Bearer ${token}`,
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
                console.log("tc", _product)

                try {
                    await axios.post(
                        `https://agriculture-traceability.vercel.app/api/v1/resources/`,
                        _product,
                        {
                            headers: {
                                // Authorization: `Bearer ${token}`,
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
                    // Authorization: `Bearer ${token}`
                }
            });
            const _products = products.filter((val) => val._id !== product._id);
            setProducts(_products);
            setDeleteProductDialog(false);
            setProduct(emptyProduct);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });

        } catch (error) {
            console.error("Error:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Xóa thất bại', life: 3000 });
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
                    <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18} onClick={() => editProduct(rowData)} />
                    <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteProduct(rowData)} />
                </div>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                <h1 className="m-0 text-2xl">Thức ăn</h1>
                <div className="flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                    <FiSearch className="text-[#278D45] w-5 h-5" />
                    <input type="search" onInput={(e) => { const target = e.target as HTMLInputElement; setGlobalFilter(target.value); }} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none" />
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
            <Button label="Lưu Thay Đổi" onClick={saveProduct} rounded />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="Không" outlined onClick={hideDeleteProductDialog} rounded />
            <Button label="Có" severity="danger" onClick={deleteProduct} rounded />
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
                    dataKey="_id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                    globalFilter={globalFilter} header={header}
                    selectionMode="multiple" scrollable scrollHeight='100vh' virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="_id" header="_id" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="species" header="Giống loài" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="barn" header="Khu vực cách ly" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column field="detectionDate" header="Ngày phát hiện" sortable style={{ minWidth: '4rem' }}
                        body={(rowData) => rowData.detectionDate ? new Date(rowData.detectionDate).toLocaleDateString() : "Chưa có"}
                    ></Column>
                    <Column field="diseaseType" header="Loại bệnh" sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="entryDate" header="Ngày tái nhập đàn"
                        body={(rowData) => rowData.entryDate ? new Date(rowData.entryDate).toLocaleDateString() : "Chưa có"}
                        sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="treatmentHistory" header="Lịch sử điều trị"
                        body={(rowData) => (
                            <button
                                className="text-blue-500 underline"
                                onClick={() => handleOpenPopup(rowData)}
                            >
                                Xem lịch sử
                            </button>
                        )} sortable style={{ minWidth: '4rem' }}></Column>
                    <Column className="bg-[#F3F7F5]" field="notes" header="Ghi chú" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column className="bg-[#F3F7F5]" header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Hồ sơ theo dõi" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Lịch sử điều trị </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* trai */}
                    <div className="grid gap-1 ">
                        <div className="field ">
                            <label htmlFor="_id" className="font-normal">ID</label>
                            <InputText id="_id" value={product._id} onChange={(e) => onInputChange(e, '_id')} required autoFocus className={classNames({ 'p-invalid': submitted && !product._id })}
                            />
                            {submitted && !product._id && <small className="p-error">_id is required.</small>}
                        </div>
                        <div className="field ">
                            <label htmlFor="barn" className="font-normal">
                                Khu vực cách ly
                            </label>
                            <InputText id="barn" value={product.barn} onChange={(e) => onInputChange(e, 'barn')} />
                        </div>

                        <div className="field">
                            <label htmlFor="detectionDate" className="font-normal">Ngày phát hiện</label>
                            <Calendar
                                id="detectionDate"
                                value={product?.detectionDate ?? new Date()}
                                onChange={(e) => setProduct({ ...product, detectionDate: e.value ?? new Date() })}
                                showIcon
                            />
                        </div>
                    </div>
                    {/* phải */}
                    <div className="grid gap-1 ">
                        <div className="field ">
                            <label htmlFor="species" className="font-normal">Giống loài</label>
                            <InputText id="species" value={product.species} onChange={(e) => onInputChange(e, 'species')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.species })}
                            />
                            {submitted && !product.species && <small className="p-error">species is required.</small>}
                        </div>
                        <div className="field ">
                            <label htmlFor="diseaseType" className="font-normal">
                                Loại bệnh
                            </label>
                            <InputText id="diseaseType" value={product.diseaseType} onChange={(e) => onInputChange(e, 'diseaseType')} />
                        </div>
                        <div className="field">
                            <label htmlFor="entryDate" className="font-normal">Ngày tái nhập đàn</label>
                            <Calendar
                                id="entryDate"
                                value={product?.entryDate ?? new Date()}
                                onChange={(e) => setProduct({ ...product, entryDate: e.value ?? new Date() })}
                                showIcon
                            />
                        </div>
                    </div>

                </div>
                <div className="field ">
                    <label htmlFor="notes" className="font-normal">
                        Ghi chú
                    </label>
                    <InputText id="notes" value={product.notes} onChange={(e) => onInputChange(e, 'notes')} />
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
            {selectedTreatment && (
                <TreatmentHistoryPopup
                    id={selectedTreatment._id}
                    diseaseType={selectedTreatment.diseaseType}
                    history={selectedTreatment.history || []}
                    onClose={handleClosePopup}
                />
            )}

        </div>
    );
}
