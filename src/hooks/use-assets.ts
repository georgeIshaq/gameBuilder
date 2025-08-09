import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: string;
  webPath: string;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  tags: string[];
  createdAt: string;
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
          'X-App-Id': appId,
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
          'X-App-Id': appId,
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

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: string): Promise<void> => {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
        headers: {
          'X-App-Id': appId,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete asset');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', appId] });
    },
  });

  // Update asset mutation
  const updateMutation = useMutation({
    mutationFn: async ({ 
      assetId, 
      updates 
    }: { 
      assetId: string; 
      updates: Partial<Pick<Asset, 'name' | 'description' | 'tags'>> 
    }): Promise<Asset> => {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': appId,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update asset');
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

  const deleteAsset = useCallback((assetId: string) => {
    return deleteMutation.mutateAsync(assetId);
  }, [deleteMutation]);

  const updateAsset = useCallback((assetId: string, updates: Partial<Pick<Asset, 'name' | 'description' | 'tags'>>) => {
    return updateMutation.mutateAsync({ assetId, updates });
  }, [updateMutation]);

  return {
    assets,
    isLoading,
    error,
    uploadAsset,
    deleteAsset,
    updateAsset,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error,
    updateError: updateMutation.error,
  };
}
