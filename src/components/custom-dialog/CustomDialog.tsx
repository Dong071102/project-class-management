import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface CustomDialogProps {
  visible: boolean;
  header: string;
  onHide: () => void;
  type: "deleteMany" | "deleteOne" | string;
  deleteSelectedProducts?: () => void;
  deleteProduct?: () => void;
  productNameMany?: string;
  productName?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  header,
  onHide,
  type,
  deleteSelectedProducts,
  deleteProduct,
  productNameMany,
  productName,
}) => {
  const getFooter = () => {
    switch (type) {
      case "deleteMany":
        return (
          <>
            <Button
              label="Thoát"
              severity="secondary"
              outlined
              onClick={onHide}
              className="button_Dia"
            />
            <Button
              label="Đồng ý"
              onClick={deleteSelectedProducts}
              severity="danger"
              className="button_Dia"
            />
          </>
        );
      case "deleteOne":
        return (
          <>
            <Button
              className="button_Dia"
              label="Thoát"
              severity="secondary"
              outlined
              onClick={onHide}
            />
            <Button
              className="button_Dia"
              label="Đồng ý"
              severity="danger"
              onClick={deleteProduct}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header={header}
      modal
      footer={getFooter()}
      onHide={onHide}
    >
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
        {type === "deleteMany" && <span>Bạn có chắc chắn xóa những {productNameMany} này?</span>}
        {type === "deleteOne" && (
          <span>
            Bạn có chắc chắn muốn xóa <b>{productName}</b>?
          </span>
        )}
      </div>
    </Dialog>
  );
};

export default CustomDialog;
