import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AttendanceService } from '../herd/data';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiSearch, FiPlus } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { Calendar } from 'primereact/calendar';
import { RadioButton } from "primereact/radiobutton";
import HSReport from "../Class-report/HerdsReport";
import StatisticsPanel from "../../components/StatisticsPanel/StatisticsPanel"


interface Product {
  id: string | null;
  studentId: string;
  fullName: string;
  className: string;
  attendanceDate: string;
  attendanceStatus: string;
  totalAttendanceDays: number;
}

export default function ProductsDemo() {
  const emptyProduct: Product = {
    id: null,
    studentId: '',
    fullName: '',
    className: '',
    attendanceDate: "",
    attendanceStatus: '',
    totalAttendanceDays: 0,

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
    AttendanceService.getAttendance()
      .then((data) => setProducts(data));
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

    if (product.studentId.trim()) {
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
    const chars = '0123456789';
    for (let i = 0; i < 7; i++) {
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
        <h1 className="m-0 text-2xl">Quản lý điểm danh</h1>
        <div className="flex items-center gap-2 text-xs rounded-[16px] bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
          <FiSearch className="text-[#278D45] w-5 h-5" />
          <input type="search" onInput={(e) => { const target = e.target as HTMLInputElement; setGlobalFilter(target.value); }} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none" />
          <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
        </div>
      </div>
      <div className="flex gap-5">
        <div onClick={openNew} className="flex gap-1 p-2 rounded-[16px] items-center justify-between text-white bg-[#3D6649] cursor-pointer hover:bg-green-900">
          <FiPlus size={18} />
          <p className="text-base font-normal">Nhập/Xuất Excel</p>
        </div>
        <div onClick={openNew} className="flex gap-1 p-2 rounded-[16px] items-center justify-between text-white bg-[#76BC6A] cursor-pointer hover:bg-green-600">
          <FiPlus size={18} />
          <p className="text-base font-normal">Thêm mới</p>
        </div>
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
  const onStatusChange = (status: string) => {
    setProduct({ ...product, attendanceStatus: status });
  };
  return (
    <div>
      <Toast ref={toast} />


      <div className="mb-5">
        <StatisticsPanel />
      </div>
      <div className="mb-5">
        <DataTable className="p-2 bg-[#F3F7F5] rounded-[20px]" ref={dt} value={products} selection={selectedProducts}
          onSelectionChange={(e) => {
            if (Array.isArray(e.value)) {
              setSelectedProducts(e.value);
            }
          }}
          sortIcon={(options) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />}
          dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
          globalFilter={globalFilter} header={header}
          selectionMode="multiple" scrollable scrollHeight='100vh' virtualScrollerOptions={{ itemSize: 46 }} tableStyle={{ minWidth: '50rem' }}>
          <Column className="bg-[#F3F7F5]" selectionMode="multiple" exportable={false}></Column>
          <Column className="bg-[#F3F7F5]" field="studentId" header="MSSV" sortable style={{ minWidth: '1rem' }}></Column>
          <Column className="bg-[#F3F7F5]" field="fullName" header="Họ tên" sortable style={{ minWidth: '4rem' }}></Column>
          <Column className="bg-[#F3F7F5]" field="className" header="Lớp học" sortable style={{ minWidth: '4rem' }}></Column>
          <Column className="bg-[#F3F7F5]" field="attendanceDate" header="Điểm danh ngày" sortable ></Column>
          <Column className="bg-[#F3F7F5]" field="attendanceStatus" header="Trạng thái" sortable style={{ minWidth: '4rem' }}></Column>
          <Column className="bg-[#F3F7F5]" field="totalAttendanceDays" header="Tổng ngày" sortable style={{ minWidth: '4rem' }}></Column>
          <Column className="bg-[#F3F7F5]" header="Thao tác" body={actionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>

        </DataTable>
      </div>

      <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
        <p className="mb-4 text-black">Quản lý điểm danh</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className="field">
            <label htmlFor="studentId" className="font-normal">
              Thông tin học sinh
            </label>
            <label htmlFor="fullName" className="font-normal">  MSSV </label>
            <InputText id="studentId" value={product.studentId} onChange={(e) => onInputChange(e, 'studentId')} required
              autoFocus className={classNames({ 'p-invalid': submitted && !product.studentId })}
            />
            {submitted && !product.studentId && <small className="p-error">studentId is required.</small>}
          </div>

          <div className="field ">
            <label htmlFor="fullName" className="font-normal">  Họ và tên </label>
            <InputText id="fullName" value={product.fullName} onChange={(e) => onInputChange(e, 'fullName')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.fullName })}
            />
            {submitted && !product.fullName && <small className="p-error">fullName is required.</small>}
          </div>


        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div className="field">
            <label htmlFor="attendanceDate" className="font-normal">Thời gian điểm danh</label>
            <Calendar id="attendanceDate" showIcon
            />
          </div>


        </div>

        <div className="field">
          <label className="font-normal">Trạng thái</label>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center">
              <RadioButton inputId="statusPresent" value="Có mặt"
                onChange={() => onStatusChange("Có mặt")} checked={product.attendanceStatus === "Có mặt"} />
              <label htmlFor="statusPresent" className="ml-2">Có mặt</label>
            </div>

            <div className="flex items-center">
              <RadioButton inputId="statusLate" value="Đi trễ"
                onChange={() => onStatusChange("Đi trễ")} checked={product.attendanceStatus === "Đi trễ"} />
              <label htmlFor="statusLate" className="ml-2">Đi trễ</label>
            </div>

            <div className="flex items-center">
              <RadioButton inputId="statusAbsent" value="Vắng"
                onChange={() => onStatusChange("Vắng")} checked={product.attendanceStatus === "Vắng"} />
              <label htmlFor="statusAbsent" className="ml-2">Vắng</label>
            </div>
          </div>
        </div>
        <div className="field ">
          <label htmlFor="attendanceStatus" className="font-normal">
            Ghi chú
          </label>
          <InputTextarea id="attendanceStatus" value={product.className} onChange={(e) => onInputTextAreaChange(e, 'className')} rows={4} />
        </div>
      </Dialog>
      <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
        <div className="confirmation-content flex item-center ">
          <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
          {product && (
            <span className="mt-3">
              Bạn có chắc chắn muốn xóa <b>{product.fullName}</b>?
            </span>
          )}
        </div>

      </Dialog>

      <div className="mb-5">
        <HSReport />
      </div>



    </div>

  );
}
