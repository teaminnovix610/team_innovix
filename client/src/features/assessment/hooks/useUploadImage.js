import { useMutation } from "@tanstack/react-query";
import { uploadQuestionImage } from "../services/upload.service";

export function useUploadImage() {
    return useMutation({
        mutationFn: uploadQuestionImage,
    });
}

export default useUploadImage;