import React, { useContext,useRef } from "react";
import axios from "axios";
import { Toast } from 'primereact/toast';
import { useForm } from "react-hook-form";
import { Galleria } from "primereact/galleria";
import { InputText } from "primereact/inputtext";
import { AuthContext } from "../../hooks/user";

interface ImageUploaderProps {
  uploadUrl: string;
  images: { path: string; _id: string }[];
}

interface FormData {
  file: FileList;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ uploadUrl, images}) => {
  const { token } = useContext(AuthContext);
  const { register, handleSubmit } = useForm<FormData>();
    const toast = useRef<Toast>(null);

  const upLoadImage = async (data: FormData) => {
    const formData = new FormData();
    Array.from(data.file).forEach((file) => formData.append("images", file));
    
    try {
      await axios.patch(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: "Chỉnh ảnh thành công",
        life: 3000,
    });
      /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg;
      if (errorMessage?.includes("large")) {
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "file quá lớn",
            life: 3000,
        });
      }
      console.error("Error img:", error);
    }
  };

  const thumbnailTemplate = (item: { path: string; name: string }) => (
    <img
      src={item.path}
      alt={item.name}
      style={{ width: "100%", overflow: "hidden", maxHeight: "200px" }}
    />
  );

  const thumbnail = (item: { path: string; name: string }) => (
    <img
      src={item.path}
      alt={item.name}
      style={{ width: "100%", overflow: "hidden", maxHeight: "400px" }}
    />
  );

  return (
    <div>
    <Toast ref={toast} />
      <Galleria
        className="Image_animals"
        value={images}
        numVisible={5}
        circular
        showItemNavigators
        showItemNavigatorsOnHover
        showIndicators
        showThumbnails={false}
        style={{ maxWidth: "640px" }}
        item={thumbnail}
        thumbnail={thumbnailTemplate}
      />
      <form
        className="flex "
        encType="multipart/form-data"
        onSubmit={handleSubmit(upLoadImage)}
      >
        <InputText
         style={{ marginRight: '10px' }}
          className="flex-2 cursor-pointer"
          type="file"
          multiple
          {...register("file")}
          accept="image/*"
        />
        <InputText className="flex-1 cursor-pointer" type="submit" value="Thêm" />
      </form>
    </div>
  );
};

export default ImageUploader;
