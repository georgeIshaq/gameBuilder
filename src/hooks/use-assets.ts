import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Asset {
  id: string; // Unique identifier for the asset
  name: string;
  description: string;
  type: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  tags: string[];
  webPath: string;
  deployedUrl?: string; // URL from Freestyle web deployment
  uploadedAt: string;
}

export interface UploadAssetData {
  file: File;
  name: string;
  description: string;
  type: string;
  tags: string[];
}

export function useAssets(appId: string) {
  const queryClient = useQueryClient();

  // Fetch assets
  const {
    data: assets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assets', appId],
    queryFn: async (): Promise<Asset[]> => {
      const response = await fetch('/api/assets/upload', {
        headers: {
          'Adorable-App-Id': appId,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const data = await response.json();
      return data.assets;
    },
    enabled: !!appId,
  });

  // Upload asset mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadAssetData): Promise<Asset> => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('type', data.type);
      formData.append('tags', JSON.stringify(data.tags));

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: {
          'Adorable-App-Id': appId,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload asset');
      }

      const result = await response.json();
      return result.asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', appId] });
    },
  });

  const uploadAsset = useCallback((data: UploadAssetData) => {
    return uploadMutation.mutateAsync(data);
  }, [uploadMutation]);

  return {
    assets,
    isLoading,
    error,
    uploadAsset,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
}
