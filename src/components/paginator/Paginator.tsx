import { Paginator } from "primereact/paginator";

interface CustomPaginatorProps{
    currentPage: number;
    totalRecords: number;
    rows: number;
    onPageChange: (event: { first: number; rows: number; page: number; pageCount: number }) => void;
}
const CustomPaginator: React.FC<CustomPaginatorProps> = ({ currentPage, totalRecords, rows, onPageChange }) => {
    return (
      <Paginator
        first={(currentPage - 1) * rows}
        totalRecords={totalRecords}
        rows={rows}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={onPageChange}
      />
    );
  };
  
  export default CustomPaginator;