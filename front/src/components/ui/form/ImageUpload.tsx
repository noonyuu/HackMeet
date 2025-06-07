import { useState, useCallback, useRef, useEffect } from "react";
import {
  UseFormSetValue,
  UseFormTrigger,
  Path,
  FieldValues,
  FieldError,
  PathValue,
} from "react-hook-form";
import imagePlus from "@/assets/icons/image-plus.svg";
import imageDelete from "@/assets/icons/circle-x.svg";

// 内部で管理する画像の状態
interface DisplayImage {
  id: string;
  url: string;
  file?: File; // 新規ファイルの場合のみ存在する
}

interface ImageUploadProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  setValue: UseFormSetValue<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  error?: FieldError;
  maxFiles?: number;
  initialUrls?: string[]; // 既存画像のURLを受け取る
  isEditable?: boolean; // 編集可否を制御
}

export const ImageUpload = <TFieldValues extends FieldValues>({
  name,
  label,
  setValue,
  trigger,
  error,
  maxFiles = 5,
  initialUrls = [],
  isEditable = true,
}: ImageUploadProps<TFieldValues>) => {
  const [displayImages, setDisplayImages] = useState<DisplayImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // 既存画像のURLが変更されたら、表示状態をリセット
  useEffect(() => {
    // initialUrlsが配列なのでdisplayImagesにそれぞれ設定したい
    initialUrls.forEach((url, index) => {
      const id = `${Date.now()}-${index}-${url}`;
      const existingImage = displayImages.find((img) => img.url === url);
      if (!existingImage) {
        setDisplayImages((prev) => [
          ...prev,
          { id, url, file: undefined }, // 既存画像はfileを持たない
        ]);
      }
    });
  }, [displayImages, initialUrls]);

  // 親フォームの状態を更新（新規ファイルのみを渡す）
  const updateFormState = useCallback(
    (currentImages: DisplayImage[]) => {
      const newFiles = currentImages
        .filter((img) => img.file)
        .map((img) => img.file as File);
      setValue(name, newFiles as PathValue<TFieldValues, typeof name>, {
        shouldValidate: true,
      });
      trigger(name);
    },
    [name, setValue, trigger],
  );

  // 新規ファイルが選択されたら、プレビューを生成して状態を更新
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const newFiles = Array.from(e.target.files || []);
    if (displayImages.length + newFiles.length > maxFiles) {
      alert(`画像は最大${maxFiles}枚までです。`);
      e.target.value = "";
      return;
    }
    const fileReadPromises = newFiles.map((file) => {
      return new Promise<DisplayImage>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `${Date.now()}-${file.name}`,
            url: reader.result as string,
            file,
          });
        };
        reader.readAsDataURL(file);
      });
    });
    Promise.all(fileReadPromises).then((newImages) => {
      setDisplayImages((prev) => {
        const updated = [...prev, ...newImages];
        updateFormState(updated);
        return updated;
      });
    });
    if (e.target) e.target.value = "";
  };

  const handleRemoveFile = (idToRemove: string) => {
    if (!isEditable) return;
    const updated = displayImages.filter((img) => img.id !== idToRemove);
    setDisplayImages(updated);
    updateFormState(updated);
  };

  const handleDragStart = (_e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isEditable) setDraggedId(id);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isEditable) e.preventDefault();
  };
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number,
  ) => {
    if (!isEditable || !draggedId) return;
    e.preventDefault();
    const files = [...displayImages];
    const draggedIndex = files.findIndex((f) => f.id === draggedId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;
    const [draggedItem] = files.splice(draggedIndex, 1);
    files.splice(dropIndex, 0, draggedItem);
    setDisplayImages(files);
    updateFormState(files);
    setDraggedId(null);
  };
  const handleDragEnd = () => {
    if (isEditable) setDraggedId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-gray-700">{label}</label>
      <div
        className={`flex flex-col gap-4 md:flex-row ${!isEditable ? "pointer-events-none opacity-70" : ""}`}
      >
        {displayImages.length > 0 ? (
          <div
            onDrop={(e) => handleDrop(e, 0)}
            onDragOver={handleDragOver}
            className="relative aspect-video w-full rounded-md border-2 border-green-500 p-1 shadow-lg md:w-1/2 lg:w-2/5"
          >
            <div
              draggable={isEditable}
              onDragStart={(e) => handleDragStart(e, displayImages[0].id)}
              onDragEnd={handleDragEnd}
              className="h-full w-full cursor-grab"
            >
              <img
                src={displayImages[0].url}
                alt="メイン画像プレビュー"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="absolute top-1 left-1 rounded-br-md bg-green-500 px-2 py-0.5 text-xs text-white">
              メイン
            </span>
            {isEditable && (
              <button
                type="button"
                onClick={() => handleRemoveFile(displayImages[0].id)}
                className="absolute top-1 right-1 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
              >
                <img src={imageDelete} alt="削除" className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          isEditable && (
            <label
              htmlFor={name as string}
              className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-green-400 md:w-1/2 lg:w-2/5"
            >
              <img
                src={imagePlus}
                alt="画像追加"
                className="h-10 w-10 opacity-50"
              />
              <span className="text-sm">メイン画像を追加</span>
              <input
                ref={fileInputRef}
                id={name as string}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={handleFilesChange}
              />
            </label>
          )
        )}
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4">
          {displayImages.slice(1).map((image, index) => (
            <div
              key={image.id}
              onDrop={(e) => handleDrop(e, index + 1)}
              onDragOver={handleDragOver}
              className="relative aspect-video rounded-md border border-gray-300"
            >
              <div
                draggable={isEditable}
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragEnd={handleDragEnd}
                className="h-full w-full cursor-grab"
              >
                <img
                  src={image.url}
                  alt={`サブ画像プレビュー ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(image.id)}
                  className="absolute top-1 right-1 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                >
                  <img src={imageDelete} alt="削除" className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {isEditable && displayImages.length < maxFiles && (
            <label
              htmlFor={`${name as string}-add`}
              className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-2 text-center hover:border-green-400"
            >
              <img src={imagePlus} alt="追加" className="h-6 w-6 opacity-50" />
              <span className="text-xs">サブ画像</span>
              <input
                id={`${name as string}-add`}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={handleFilesChange}
              />
            </label>
          )}
        </div>
      </div>
      {error?.message && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};
