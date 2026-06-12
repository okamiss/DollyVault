import { PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { http } from '../api/http';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  max?: number;
}

export function ImageUploader({ value = [], onChange, max = 5 }: ImageUploaderProps) {
  const fileList: UploadFile[] = value.map((image, index) => ({
    uid: image.objectKey || String(index),
    name: image.objectKey || `image-${index + 1}`,
    status: 'done',
    url: image.url,
  }));

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const formData = new FormData();
    formData.append('files', options.file as File);
    try {
      const { data } = await http.post<{ items: UploadedImage[] }>(
        '/uploads/images',
        formData,
      );
      onChange?.([...value, ...data.items].slice(0, max));
      options.onSuccess?.(data);
    } catch (error) {
      message.error('图片上传失败，请检查 OSS 配置');
      options.onError?.(error as Error);
    }
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      customRequest={customRequest}
      onRemove={(file) => {
        onChange?.(value.filter((image) => image.objectKey !== file.uid));
      }}
      maxCount={max}
      accept="image/*"
    >
      {value.length >= max ? null : (
        <div>
          <PlusOutlined />
          <div className="upload-label">添加图片</div>
        </div>
      )}
    </Upload>
  );
}
