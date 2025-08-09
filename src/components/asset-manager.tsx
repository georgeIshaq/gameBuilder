"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Download, Image, Music, Video, FileText, Package } from 'lucide-react';
import { useAssets, type Asset } from '@/hooks/use-assets';
import { AssetUpload } from './asset-upload';
import { toast } from 'sonner';

interface AssetManagerProps {
  appId: string;
}

const assetTypeIcons = {
  image: Image,
  audio: Music,
  video: Video,
  sprite: Package,
  tilemap: Package,
  font: FileText,
  json: FileText,
  other: Package,
};

export function AssetManager({ appId }: AssetManagerProps) {
  const { assets, isLoading, deleteAsset, updateAsset, isDeleting, isUpdating } = useAssets(appId);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', tags: '' });

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditForm({
      name: asset.name,
      description: asset.description,
      tags: asset.tags.join(', '),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;

    try {
      const tags = editForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      await updateAsset(editingAsset.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        tags,
      });

      toast.success('Asset updated successfully!');
      setEditingAsset(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update asset');
    }
  };

  const handleDelete = async (assetId: string, assetName: string) => {
    if (!confirm(`Are you sure you want to delete "${assetName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAsset(assetId);
      toast.success('Asset deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete asset');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Game Assets</h2>
          <p className="text-gray-600">Manage your game assets and resources</p>
        </div>
        <AssetUpload appId={appId} />
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
          <p className="text-gray-600 mb-4">Upload your first game asset to get started</p>
          <AssetUpload appId={appId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const IconComponent = assetTypeIcons[asset.type as keyof typeof assetTypeIcons] || Package;
            
            return (
              <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-medium truncate">{asset.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {asset.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Preview */}
                  {asset.type === 'image' && (
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={asset.webPath}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Description */}
                  {asset.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
                  )}
                  
                  {/* Tags */}
                  {asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{asset.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(asset.fileSize)}</span>
                    </div>
                    {asset.width && asset.height && (
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span>{asset.width}×{asset.height}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(asset.webPath, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(asset)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(asset.id, asset.name)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Asset name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this asset for the AI"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="player, character, hero"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editForm.name.trim()}
                className="flex-1"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingAsset(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
