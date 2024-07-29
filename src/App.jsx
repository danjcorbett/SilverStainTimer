import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const defaultSteps = [
  { name: 'Fixation', duration: 30 * 60 },
  { name: 'Washing', duration: 10 * 60 },
  { name: 'Sensitization', duration: 30 * 60 },
  { name: 'Washing', duration: 10 * 60 },
  { name: 'Silver reaction', duration: 20 * 60 },
  { name: 'Washing', duration: 5 * 60 },
  { name: 'Development', duration: 5 * 60 },
  { name: 'Stop reaction', duration: 10 * 60 },
];

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SilverStainingTimer = () => {
  const [steps, setSteps] = useState(defaultSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const stepCompleteAudioRef = useRef(null);
  const experimentCompleteAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setProgress((prev) => prev + (100 / steps[currentStep].duration));
      }, 1000);
    } else if (timeLeft === 0 && currentStep < steps.length - 1) {
      handleStepComplete();
    } else if (timeLeft === 0 && currentStep === steps.length - 1) {
      handleExperimentComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentStep, steps]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const playSound = (audioRef) => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error('Audio playback failed', error));
    }
  };

  const handleStepComplete = () => {
    setShowAlert(true);
    playSound(stepCompleteAudioRef);
    setCurrentStep((prev) => prev + 1);
    setTimeLeft(steps[currentStep + 1].duration);
    setProgress(0);
  };

  const handleExperimentComplete = () => {
    setIsRunning(false);
    setShowAlert(true);
    playSound(experimentCompleteAudioRef);
  };

  const handleStart = () => {
    setIsRunning(true);
    playSound(buttonClickAudioRef);
  };

  const handlePause = () => {
    setIsRunning(false);
    playSound(buttonClickAudioRef);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeLeft(steps[0].duration);
    setShowAlert(false);
    setProgress(0);
    playSound(buttonClickAudioRef);
  };

  const handleAddStep = () => {
    setSteps([...steps, { name: 'New Step', duration: 5 * 60 }]);
    playSound(buttonClickAudioRef);
  };

  const handleRemoveStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
    if (currentStep >= newSteps.length) {
      setCurrentStep(newSteps.length - 1);
      setTimeLeft(newSteps[newSteps.length - 1].duration);
    }
    playSound(buttonClickAudioRef);
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = field === 'duration' ? parseInt(value) * 60 : value;
    setSteps(newSteps);
    if (index === currentStep) {
      setTimeLeft(newSteps[index].duration);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    playSound(buttonClickAudioRef);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Advanced Silver Staining Timer
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
              <Label htmlFor="dark-mode">{darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">{steps[currentStep].name}</h2>
            <p className="text-4xl font-mono">{formatTime(timeLeft)}</p>
            <Progress value={progress} className="mt-2" />
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {!isRunning ? (
              <Button onClick={handleStart}>Start</Button>
            ) : (
              <Button onClick={handlePause}>Pause</Button>
            )}
            <Button onClick={handleReset}>Reset</Button>
            <Button onClick={toggleSound}>
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experiment Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={step.name}
                onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                className="flex-grow"
              />
              <Input
                type="number"
                value={step.duration / 60}
                onChange={(e) => handleStepChange(index, 'duration', e.target.value)}
                className="w-20"
              />
              <Button variant="outline" size="icon" onClick={() => handleRemoveStep(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddStep} className="mt-2">
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
        </CardContent>
      </Card>

      {showAlert && (
        <Alert className="mt-4">
          <Bell className="h-4 w-4" />
          <AlertTitle>Step Complete!</AlertTitle>
          <AlertDescription>
            {currentStep < steps.length - 1
              ? `Time to start: ${steps[currentStep].name}`
              : 'Silver staining process complete!'}
          </AlertDescription>
        </Alert>
      )}

      <audio ref={stepCompleteAudioRef} src="/api/placeholder/audio/step-complete.mp3" />
      <audio ref={experimentCompleteAudioRef} src="/api/placeholder/audio/experiment-complete.mp3" />
      <audio ref={buttonClickAudioRef} src="/api/placeholder/audio/button-click.mp3" />
    </div>
  );
};

export default SilverStainingTimer;
