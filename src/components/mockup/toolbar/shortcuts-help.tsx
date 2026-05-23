"use client";

/**
 * Shortcuts Help Modal Component for Stigmator 3D Mockup Generator
 * 
 * Displays keyboard shortcuts reference in a modal dialog.
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Keyboard,
  Save,
  Download,
  Play,
  Square,
  RotateCcw,
  Maximize,
  Grid3X3,
  Scan,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  MousePointer2,
  Eye,
  Move,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

// ============================================================================
// Constants
// ============================================================================

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'File & Export',
    icon: <Save className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save preset' },
      { keys: ['Ctrl', 'E'], description: 'Export mockup' },
    ],
  },
  {
    title: 'View Controls',
    icon: <Eye className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Space'], description: 'Play/Pause rotation' },
      { keys: ['1'], description: 'Front view' },
      { keys: ['2'], description: 'Back view' },
      { keys: ['3'], description: 'Left view' },
      { keys: ['4'], description: 'Right view' },
      { keys: ['5'], description: '3/4 Left view' },
      { keys: ['6'], description: '3/4 Right view' },
      { keys: ['7'], description: 'Top view' },
      { keys: ['8'], description: 'Bottom view' },
      { keys: ['9'], description: 'Chest detail view' },
    ],
  },
  {
    title: 'Navigation',
    icon: <Move className="w-4 h-4" />,
    shortcuts: [
      { keys: ['R'], description: 'Reset view' },
      { keys: ['F'], description: 'Fit to screen' },
      { keys: ['G'], description: 'Toggle grid' },
      { keys: ['P'], description: 'Toggle print area' },
      { keys: ['+'], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
    ],
  },
  {
    title: 'Design Editing',
    icon: <MousePointer2 className="w-4 h-4" />,
    shortcuts: [
      { keys: ['↑'], description: 'Nudge up' },
      { keys: ['↓'], description: 'Nudge down' },
      { keys: ['←'], description: 'Nudge left' },
      { keys: ['→'], description: 'Nudge right' },
      { keys: ['Shift', 'Arrow'], description: 'Nudge 10px' },
      { keys: ['Delete'], description: 'Remove design' },
    ],
  },
];

// ============================================================================
// Helper Components
// ============================================================================

function KeyBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[24px] h-6 px-1.5',
        'bg-zinc-800 border border-zinc-700',
        'rounded text-xs font-medium text-zinc-300',
        'shadow-sm',
        className
      )}
    >
      {children}
    </kbd>
  );
}

function ShortcutItem({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-400">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index} className="flex items-center gap-1">
            <KeyBadge>
              {key === 'Ctrl' && <Command className="w-3 h-3" />}
              {key === 'Arrow' && (
                <span className="flex gap-0.5">
                  <ArrowUp className="w-2 h-2" />
                  <ArrowDown className="w-2 h-2" />
                  <ArrowLeft className="w-2 h-2" />
                  <ArrowRight className="w-2 h-2" />
                </span>
              )}
              {key === '↑' && <ArrowUp className="w-3 h-3" />}
              {key === '↓' && <ArrowDown className="w-3 h-3" />}
              {key === '←' && <ArrowLeft className="w-3 h-3" />}
              {key === '→' && <ArrowRight className="w-3 h-3" />}
              {key === '+' && <ZoomIn className="w-3 h-3" />}
              {key === '-' && <ZoomOut className="w-3 h-3" />}
              {!['Ctrl', 'Arrow', '↑', '↓', '←', '→', '+', '-'].includes(key) && key}
            </KeyBadge>
            {index < keys.length - 1 && (
              <span className="text-zinc-600 text-xs">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShortcutGroupSection({ group }: { group: ShortcutGroup }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-zinc-300 mb-3">
        <span className="text-zinc-500">{group.icon}</span>
        <span className="text-sm font-medium">{group.title}</span>
      </div>
      <div className="space-y-0.5">
        {group.shortcuts.map((shortcut, index) => (
          <ShortcutItem
            key={`${group.title}-${index}`}
            keys={shortcut.keys}
            description={shortcut.description}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-zinc-100">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                Speed up your workflow with these keyboard shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHORTCUT_GROUPS.map((group) => (
              <ShortcutGroupSection key={group.title} group={group} />
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-300 mb-2">Pro Tips</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Hold Shift while using arrow keys to nudge design by 10 pixels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Press number keys (1-9) to quickly switch between view presets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Use Space to quickly play/pause auto-rotation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>All shortcuts are disabled when typing in input fields</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShortcutsHelp;
