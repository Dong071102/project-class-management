import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { FiEdit, FiTrash2, FiChevronDown, FiSearch, FiPlus } from "react-icons/fi";

import StatisticsPanelReport from '../../components/StatisticsPanel/StatisticsPanelReport';
import AttendanceReportTable from '../../components/attendanceTable/AttendanceReportTable';
import CourseChartReport from '../ClassReportPage/courseReport';


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
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Product[]>>(null);

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
  //============================
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
        <StatisticsPanelReport />
      </div>
      <div className="mb-5">
        <CourseChartReport />
      </div>

      <div className="mb-5">
        <AttendanceReportTable />
      </div>






    </div>

  );
}
