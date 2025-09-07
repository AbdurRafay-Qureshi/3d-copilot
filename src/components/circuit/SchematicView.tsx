'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircuitSpec } from '@/types/circuit';
import { generateSchematicSVG } from '@/lib/circuit/netlistsvg-adapter';
import { Download, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SchematicViewProps {
  circuitSpec: CircuitSpec;
}

export function SchematicView({ circuitSpec }: SchematicViewProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    generateSchematic();
  }, [circuitSpec]);

  const generateSchematic = async () => {
    setIsGenerating(true);
    try {
      const svg = generateSchematicSVG(circuitSpec);
      setSvgContent(svg);
    } catch (error) {
      console.error('Error generating schematic:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${circuitSpec.circuit_name}_schematic.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schematic Diagram</CardTitle>
            <CardDescription>Electronic schematic showing component connections</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSchematic}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!svgContent}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-white">
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Generating schematic...</p>
              </div>
            </div>
          ) : svgContent ? (
            <div className="overflow-auto">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="min-w-full min-h-96"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-sm text-gray-600">No schematic available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSchematic}
                  className="mt-2"
                >
                  Generate Schematic
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {svgContent && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Schematic Information</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Components: {circuitSpec.components.length}</p>
              <p>• Connections: {circuitSpec.connections.length}</p>
              <p>• Generated using netlistsvg</p>
              <p>• Compatible with KiCad</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
