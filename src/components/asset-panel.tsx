"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Package, Image, Music, Video, FileText } from 'lucide-react';
import { useAssets } from '@/hooks/use-assets';
import { AssetUpload } from './asset-upload';

interface AssetPanelProps {
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

export function AssetPanel({ appId }: AssetPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { assets, isLoading } = useAssets(appId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t bg-gray-50/50 dark:bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Package className="w-4 h-4" />
          Game Assets ({assets.length})
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        <AssetUpload appId={appId} />
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No assets uploaded yet</p>
              <p className="text-xs text-gray-400">Upload assets for the AI to use in your game</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => {
                const IconComponent = assetTypeIcons[asset.type as keyof typeof assetTypeIcons] || Package;
                
                return (
                  <Card key={asset.id} className="p-2">
                    <div className="flex items-center gap-3">
                      {/* Asset preview/icon */}
                      <div className="flex-shrink-0">
                        {asset.type === 'image' ? (
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={asset.webPath}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Asset info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{asset.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {asset.type}
                          </Badge>
                        </div>
                        
                        {asset.description && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {asset.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatFileSize(asset.fileSize)}</span>
                          {asset.width && asset.height && (
                            <span>• {asset.width}×{asset.height}</span>
                          )}
                        </div>

                        {/* Tags */}
                        {asset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {asset.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {asset.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{asset.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick actions */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Copy asset path to clipboard for easy reference
                            navigator.clipboard.writeText(asset.webPath);
                          }}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          Copy Path
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
