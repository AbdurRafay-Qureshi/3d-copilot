'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircuitSpec } from '@/types/circuit';
import { Clock, Wrench, Zap, AlertCircle } from 'lucide-react';

interface SpecViewerProps {
  circuitSpec: CircuitSpec;
}

export function SpecViewer({ circuitSpec }: SpecViewerProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Circuit Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {circuitSpec.circuit_name}
          </CardTitle>
          <CardDescription>{circuitSpec.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Time:</span>
              <span className="text-sm">{circuitSpec.estimated_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Difficulty:</span>
              <Badge className={getDifficultyColor(circuitSpec.estimated_difficulty)}>
                {circuitSpec.estimated_difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Tools:</span>
              <span className="text-sm">{circuitSpec.required_tools.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components List */}
      <Card>
        <CardHeader>
          <CardTitle>Components ({circuitSpec.components.length})</CardTitle>
          <CardDescription>List of all components needed for this circuit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {circuitSpec.components.map((component, index) => (
              <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{component.id}</div>
                    <div className="text-sm text-gray-600">{component.value}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{component.type}</Badge>
                  <div className="text-xs text-gray-500 mt-1">{component.footprint}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Connections ({circuitSpec.connections.length})</CardTitle>
          <CardDescription>Wiring connections between components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {circuitSpec.connections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2"
                    style={{ borderColor: connection.wire_color }}
                  />
                  <span className="font-mono text-sm">
                    {connection.from} → {connection.to}
                  </span>
                </div>
                {connection.description && (
                  <span className="text-xs text-gray-500">{connection.description}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Required Tools</CardTitle>
          <CardDescription>Tools and equipment needed for assembly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {circuitSpec.required_tools.map((tool, index) => (
              <Badge key={index} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PCB Hints */}
      <Card>
        <CardHeader>
          <CardTitle>PCB Design Hints</CardTitle>
          <CardDescription>Recommended PCB layout parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium">Layers</div>
              <div className="text-sm text-gray-600">{circuitSpec.pcb_hints.layer}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Trace Width</div>
              <div className="text-sm text-gray-600">{circuitSpec.pcb_hints.trace_width}mm</div>
            </div>
            <div>
              <div className="text-sm font-medium">Via Size</div>
              <div className="text-sm text-gray-600">{circuitSpec.pcb_hints.via_size || 'N/A'}mm</div>
            </div>
            <div>
              <div className="text-sm font-medium">Clearance</div>
              <div className="text-sm text-gray-600">{circuitSpec.pcb_hints.clearance || 'N/A'}mm</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
