'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircuitSpec } from '@/types/circuit';
import { generateKiCadFromCircuit } from '@/lib/circuit/kicad-parser';
import { Download, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';

interface PCBViewProps {
  circuitSpec: CircuitSpec;
}

export function PCBView({ circuitSpec }: PCBViewProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(true);

  useEffect(() => {
    generatePCB();
  }, [circuitSpec]);

  const generatePCB = async () => {
    setIsGenerating(true);
    try {
      const { pcb } = generateKiCadFromCircuit(circuitSpec);
      setSvgContent(pcb);
    } catch (error) {
      console.error('Error generating PCB:', error);
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
      link.download = `${circuitSpec.circuit_name}_pcb.svg`;
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
            <CardTitle>PCB Layout</CardTitle>
            <CardDescription>Printed circuit board layout with traces and component placement</CardDescription>
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
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePCB}
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
                <p className="text-sm text-gray-600">Generating PCB layout...</p>
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
                <p className="text-sm text-gray-600">No PCB layout available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePCB}
                  className="mt-2"
                >
                  Generate PCB
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {svgContent && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-2">PCB Information</h4>
              <div className="text-xs text-purple-700 space-y-1">
                <p>• Layers: {circuitSpec.pcb_hints.layer}</p>
                <p>• Trace width: {circuitSpec.pcb_hints.trace_width}mm</p>
                <p>• Components: {circuitSpec.components.length}</p>
                <p>• Generated using KiCad</p>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Layer Information</h4>
              <div className="text-xs text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Top traces (red)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Bottom traces (blue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Component pads (orange)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Vias (gray)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
