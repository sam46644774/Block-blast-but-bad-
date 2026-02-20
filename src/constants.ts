import { Piece } from './types';

export const GRID_SIZE = 8;

export const COLORS = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

export const PIECE_TEMPLATES: Omit<Piece, 'id' | 'color'>[] = [
  // Single dot
  { shape: [[1]] },
  // 1x2
  { shape: [[1, 1]] },
  { shape: [[1], [1]] },
  // 1x3
  { shape: [[1, 1, 1]] },
  { shape: [[1], [1], [1]] },
  // 1x4
  { shape: [[1, 1, 1, 1]] },
  { shape: [[1], [1], [1], [1]] },
  // 1x5
  { shape: [[1, 1, 1, 1, 1]] },
  { shape: [[1], [1], [1], [1], [1]] },
  // 2x2 Square
  { shape: [[1, 1], [1, 1]] },
  // 3x3 Square
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
  // L-shapes
  { shape: [[1, 0], [1, 0], [1, 1]] },
  { shape: [[0, 1], [0, 1], [1, 1]] },
  { shape: [[1, 1], [1, 0], [1, 0]] },
  { shape: [[1, 1], [0, 1], [0, 1]] },
  // Small L
  { shape: [[1, 0], [1, 1]] },
  { shape: [[0, 1], [1, 1]] },
  { shape: [[1, 1], [1, 0]] },
  { shape: [[1, 1], [0, 1]] },
  // T-shapes
  { shape: [[1, 1, 1], [0, 1, 0]] },
  { shape: [[0, 1, 0], [1, 1, 1]] },
  { shape: [[1, 0], [1, 1], [1, 0]] },
  { shape: [[0, 1], [1, 1], [0, 1]] },
];

export const CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: '1.4.0',
    date: 'February 20, 2026',
    changes: [
      'Matched dragging and placing mechanics to the original Block Blast',
      'Pieces now scale perfectly to grid size when picked up',
      'Added "Impossible Move" dimming for pieces that can\'t be placed',
      'Enhanced ghost piece visibility and placement snapping',
      'Smoother animations for piece pickup and drop',
    ],
  },
  {
    version: '1.3.0',
    date: 'February 20, 2026',
    changes: [
      'Complete rework of the dragging and placing system',
      'Pieces now scale to grid size immediately upon drag',
      'Improved snapping logic using the piece top-left reference',
      'Smoother ghost piece transitions and visual feedback',
    ],
  },
  {
    version: '1.2.1',
    date: 'February 20, 2026',
    changes: [
      'Verified and reinforced high score persistence using localStorage',
      'Added "New Record" indicator when beating your high score',
    ],
  },
  {
    version: '1.2.0',
    date: 'February 20, 2026',
    changes: [
      'Significantly improved drag-and-drop precision',
      'Added real-time "ghost" piece preview on the grid',
      'Refined placement logic for more intuitive snapping',
      'Smoother transitions between dragging and placing states',
    ],
  },
  {
    version: '1.1.0',
    date: 'February 20, 2026',
    changes: [
      'Added full mobile touch support',
      'Improved piece tray responsiveness',
      'Updated changelog display to show newest version first',
      'Enhanced drag-and-drop experience on small screens',
    ],
  },
  {
    version: '1.0.0',
    date: 'February 20, 2026',
    changes: [
      'Initial release of Block Blast Master',
      '8x8 grid gameplay',
      'Piece rotation and placement logic',
      'Row and column clearing with combo system',
      'High score tracking',
      'Responsive design with Tailwind CSS',
    ],
  },
];
