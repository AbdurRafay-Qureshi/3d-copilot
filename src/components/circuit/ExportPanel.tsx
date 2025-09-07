'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircuitSpec, CircuitImages, ExportOptions } from '@/types/circuit';
import { CircuitExporter } from '@/lib/utils/export';
import { Download, FileText, Image, Box, Layers, CheckCircle } from 'lucide-react';

interface ExportPanelProps {
  circuitSpec: CircuitSpec;
  images: CircuitImages;
}

export function ExportPanel({ circuitSpec, images }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'svg'>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    include_schematic: true,
    include_breadboard: true,
    include_pcb: true,
    include_3d: false,
    include_assembly: true
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exporter = new CircuitExporter(circuitSpec, images);
      
      let result;
      switch (exportFormat) {
        case 'pdf':
          result = await exporter.exportPDF(exportOptions);
          break;
        case 'png':
          result = await exporter.exportPNG(exportOptions);
          break;
        case 'svg':
          result = await exporter.exportSVG(exportOptions);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      if (result.success && result.data) {
        const blob = new Blob([result.data], { 
          type: exportFormat === 'pdf' ? 'application/pdf' : 
                exportFormat === 'png' ? 'image/png' : 'image/svg+xml'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `${circuitSpec.circuit_name}_export.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handle3DExport = async (format: 'stl' | 'obj') => {
    setIsExporting(true);
    try {
      const exporter = new CircuitExporter(circuitSpec, images);
      
      let result;
      if (format === 'stl') {
        result = await exporter.exportSTL();
      } else {
        result = await exporter.exportOBJ();
      }

      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `${circuitSpec.circuit_name}_3d.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || '3D export failed');
      }
    } catch (error) {
      console.error('3D export error:', error);
      alert(`3D export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (option: keyof Omit<ExportOptions, 'format'>) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Export Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Circuit
          </CardTitle>
          <CardDescription>
            Export your circuit design in various formats for sharing, printing, or manufacturing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Export Format</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">PDF</div>
                  <div className="text-xs text-gray-500">Document</div>
                </button>
                <button
                  onClick={() => setExportFormat('png')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    exportFormat === 'png'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">PNG</div>
                  <div className="text-xs text-gray-500">Image</div>
                </button>
                <button
                  onClick={() => setExportFormat('svg')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    exportFormat === 'svg'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">SVG</div>
                  <div className="text-xs text-gray-500">Vector</div>
                </button>
              </div>
            </div>

            {/* Content Selection */}
            <div>
              <h3 className="text-sm font-medium mb-3">Include in Export</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_schematic}
                    onChange={() => toggleOption('include_schematic')}
                    className="rounded"
                  />
                  <span className="text-sm">Schematic Diagram</span>
                  {images.schematic && <CheckCircle className="h-4 w-4 text-green-600" />}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_breadboard}
                    onChange={() => toggleOption('include_breadboard')}
                    className="rounded"
                  />
                  <span className="text-sm">Breadboard Layout</span>
                  {images.breadboard && <CheckCircle className="h-4 w-4 text-green-600" />}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_pcb}
                    onChange={() => toggleOption('include_pcb')}
                    className="rounded"
                  />
                  <span className="text-sm">PCB Layout</span>
                  {images.pcb && <CheckCircle className="h-4 w-4 text-green-600" />}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_3d}
                    onChange={() => toggleOption('include_3d')}
                    className="rounded"
                  />
                  <span className="text-sm">3D Render</span>
                  {images.render_3d && <CheckCircle className="h-4 w-4 text-green-600" />}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_assembly}
                    onChange={() => toggleOption('include_assembly')}
                    className="rounded"
                  />
                  <span className="text-sm">Assembly Guide</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </label>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3D Export Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            3D Model Export
          </CardTitle>
          <CardDescription>
            Export 3D models for 3D printing or CAD software
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handle3DExport('stl')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Box className="h-4 w-4" />
              Export STL
            </Button>
            <Button
              variant="outline"
              onClick={() => handle3DExport('obj')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Export OBJ
            </Button>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>• STL: For 3D printing</p>
            <p>• OBJ: For CAD software</p>
          </div>
        </CardContent>
      </Card>

      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Schematic</span>
              {images.schematic ? (
                <Badge variant="outline" className="text-green-600">Ready</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Not generated</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Breadboard</span>
              {images.breadboard ? (
                <Badge variant="outline" className="text-green-600">Ready</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Not generated</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>PCB Layout</span>
              {images.pcb ? (
                <Badge variant="outline" className="text-green-600">Ready</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Not generated</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>3D Render</span>
              {images.render_3d ? (
                <Badge variant="outline" className="text-green-600">Ready</Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">Not generated</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
