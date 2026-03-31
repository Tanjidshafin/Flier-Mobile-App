import { useMutation } from '@tanstack/react-query';
import { launchImageLibrary } from 'react-native-image-picker';

import { createAvatarUploadSignature, updateProfile } from '../../services/api';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: updateProfile,
  });
}

export async function pickProfileImage() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 1,
  });

  if (result.didCancel || !result.assets?.[0]) {
    return null;
  }

  return result.assets[0];
}

export async function uploadAvatarToCloudinary() {
  const asset = await pickProfileImage();

  if (!asset?.uri || !asset.type || !asset.fileName) {
    return null;
  }

  const signature = await createAvatarUploadSignature();
  const formData = new FormData();
  formData.append('file', {
    name: asset.fileName,
    type: asset.type,
    uri: asset.uri,
  } as never);
  formData.append('api_key', signature.apiKey);
  formData.append('folder', signature.folder);
  formData.append('public_id', signature.publicId);
  formData.append('signature', signature.signature);
  formData.append('timestamp', `${signature.timestamp}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      body: formData,
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error('Avatar upload failed.');
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
  };

  return {
    publicId: payload.public_id,
    url: payload.secure_url,
  };
}
