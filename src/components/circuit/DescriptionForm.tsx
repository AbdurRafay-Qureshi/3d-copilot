'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';

interface DescriptionFormProps {
  onGenerate: (description: string) => void;
  isLoading: boolean;
}

export function DescriptionForm({ onGenerate, isLoading }: DescriptionFormProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate(description.trim());
    }
  };

  const examplePrompts = [
    "Build a 555 LED blinker circuit",
    "Create an Arduino temperature sensor with LCD display",
    "Design a simple audio amplifier using LM386",
    "Make a basic power supply with voltage regulation",
    "Build a digital clock with 7-segment displays"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          Real Circuit Image Copilot
        </CardTitle>
        <CardDescription>
          Describe the circuit you want to build and we'll generate the schematic, breadboard layout, PCB design, and assembly guide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Circuit Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the circuit you want to build... (e.g., 'Build a 555 LED blinker circuit')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!description.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Circuit...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Circuit
              </>
            )}
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Example Prompts:</h3>
          <div className="space-y-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setDescription(prompt)}
                className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border transition-colors"
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
