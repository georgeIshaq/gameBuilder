"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, Image, Music, Video, FileText, Package } from 'lucide-react';
import { useAssets, type UploadAssetData } from '@/hooks/use-assets';
import { toast } from 'sonner';

interface AssetUploadProps {
  appId: string;
  onUploadComplete?: () => void;
}

const assetTypes = [
  { value: 'image', label: 'Image', icon: Image },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'sprite', label: 'Sprite', icon: Package },
  { value: 'tilemap', label: 'Tilemap', icon: Package },
  { value: 'font', label: 'Font', icon: FileText },
  { value: 'json', label: 'JSON', icon: FileText },
  { value: 'other', label: 'Other', icon: Package },
];

export function AssetUpload({ appId, onUploadComplete }: AssetUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('image');
  const [tags, setTags] = useState('');

  const { uploadAsset, isUploading, uploadError } = useAssets(appId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setName(file.name.split('.')[0]); // Remove extension for default name
      
      // Auto-detect type based on MIME type
      if (file.type.startsWith('image/')) {
        setType('image');
      } else if (file.type.startsWith('audio/')) {
        setType('audio');
      } else if (file.type.startsWith('video/')) {
        setType('video');
      } else if (file.type === 'application/json') {
        setType('json');
      } else {
        setType('other');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/json': ['.json'],
      'application/font-woff': ['.woff'],
      'application/font-woff2': ['.woff2'],
      'font/ttf': ['.ttf'],
      'font/otf': ['.otf'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile || !name.trim()) {
      toast.error('Please select a file and provide a name');
      return;
    }

    try {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      await uploadAsset({
        file: selectedFile,
        name: name.trim(),
        description: description.trim(),
        type,
        tags: tagArray,
      });

      toast.success('Asset uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setName('');
      setDescription('');
      setTags('');
      setIsOpen(false);
      
      onUploadComplete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload asset');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Game Asset</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Package className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the file here...'
                    : 'Drag & drop a file here, or click to select'}
                </p>
                <p className="text-xs text-gray-500">
                  Images, audio, video, JSON, fonts supported
                </p>
              </div>
            )}
          </div>

          {/* Asset Details */}
          {selectedFile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>

              <div>
                <Label htmlFor="type">Asset Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((assetType) => {
                      const Icon = assetType.icon;
                      return (
                        <SelectItem key={assetType.value} value={assetType.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {assetType.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this asset for the AI (e.g., 'Player character sprite', 'Background music for level 1')"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="player, character, hero, sprite"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !name.trim()}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload Asset'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>

              {uploadError && (
                <p className="text-sm text-red-600">
                  {uploadError instanceof Error ? uploadError.message : 'Upload failed'}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
