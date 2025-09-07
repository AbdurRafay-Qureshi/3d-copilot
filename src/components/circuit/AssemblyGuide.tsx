'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircuitSpec } from '@/types/circuit';
import { CheckCircle, Circle, Wrench, AlertTriangle, Clock } from 'lucide-react';

interface AssemblyGuideProps {
  circuitSpec: CircuitSpec;
}

export function AssemblyGuide({ circuitSpec }: AssemblyGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStepCompletion = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  const nextStep = () => {
    if (currentStep < circuitSpec.assembly_steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (completedSteps.size / circuitSpec.assembly_steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assembly Guide</CardTitle>
            <CardDescription>Step-by-step instructions for building your circuit</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {circuitSpec.estimated_time}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {circuitSpec.required_tools.length} tools
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-500">
              {completedSteps.size} of {circuitSpec.assembly_steps.length} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {circuitSpec.assembly_steps.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Step {currentStep + 1} of {circuitSpec.assembly_steps.length}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextStep}
                  disabled={currentStep === circuitSpec.assembly_steps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStepCompletion(circuitSpec.assembly_steps[currentStep].step_number)}
                  className="mt-1"
                >
                  {completedSteps.has(circuitSpec.assembly_steps[currentStep].step_number) ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {circuitSpec.assembly_steps[currentStep].description}
                  </p>
                  
                  {circuitSpec.assembly_steps[currentStep].components && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Components needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {circuitSpec.assembly_steps[currentStep].components!.map((component, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {circuitSpec.assembly_steps[currentStep].tools && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Tools needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {circuitSpec.assembly_steps[currentStep].tools!.map((tool, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Steps List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-3">All Steps</h3>
          {circuitSpec.assembly_steps.map((step, index) => (
            <div
              key={step.step_number}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                index === currentStep
                  ? 'bg-blue-50 border-blue-200'
                  : completedSteps.has(step.step_number)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompletion(step.step_number);
                  }}
                  className="mt-1"
                >
                  {completedSteps.has(step.step_number) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      Step {step.step_number}
                    </span>
                    {index === currentStep && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{step.description}</p>
                  
                  {(step.components || step.tools) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {step.components?.map((component, compIndex) => (
                        <Badge key={compIndex} variant="secondary" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                      {step.tools?.map((tool, toolIndex) => (
                        <Badge key={toolIndex} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">Safety Tips</h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Always disconnect power before making connections</li>
                <li>• Double-check component polarity before connecting</li>
                <li>• Use appropriate tools for the job</li>
                <li>• Work in a well-lit area</li>
                <li>• Keep your workspace clean and organized</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
