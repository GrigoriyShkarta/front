/**
 * Shared types for the custom whiteboard canvas.
 */

export type StrokeStyle = 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'wavy';

export type ToolType = 'select' | 'hand' | 'pen' | 'highlighter' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'eraser' | 'diamond' | 'triangle';

export interface BaseElement {
  id: string;
  angle?: number;
  loading?: boolean;
  is_locked?: boolean;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface PathElement extends BaseElement {
  type: 'path';
  d: string;
  color: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  fill: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface DiamondElement extends BaseElement {
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface TriangleElement extends BaseElement {
  type: 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  stroke_width: number;
  stroke_style?: StrokeStyle;
  opacity: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  x: number;
  y: number;
  content: string;
  color: string;
  font_size: number;
  font_weight: 'normal' | 'bold';
  font_style: 'normal' | 'italic';
  text_decoration: 'none' | 'underline' | 'line-through';
  font_family: string;
  width?: number;
  opacity: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name: string;
  opacity: number;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name: string;
  opacity: number;
}

export interface AudioElement extends BaseElement {
  type: 'audio';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name: string;
  opacity: number;
}

export interface YoutubeElement extends BaseElement {
  type: 'youtube';
  x: number;
  y: number;
  width: number;
  height: number;
  video_id: string;
  name: string;
  opacity: number;
}

export interface EmbedElement extends BaseElement {
  type: 'embed';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name: string;
  opacity: number;
}

export interface LinkElement extends BaseElement {
  type: 'link';
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  title: string;
  description?: string;
  image?: string;
  opacity: number;
}

export interface FileElement extends BaseElement {
  type: 'file';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  name: string;
  ext: string;
  opacity: number;
}

export type BoardElement =
  | PathElement
  | RectElement
  | EllipseElement
  | LineElement
  | ArrowElement
  | DiamondElement
  | TriangleElement
  | TextElement
  | ImageElement
  | VideoElement
  | AudioElement
  | YoutubeElement
  | EmbedElement
  | LinkElement
  | FileElement;

export type GridType = 'cells' | 'dots' | 'none';

export interface BoardData {
  elements: BoardElement[];
  student_id?: string;
  pan_x: number;
  pan_y: number;
  zoom: number;
  bg_color?: string;
  grid_type?: GridType;
  board_theme?: 'light' | 'dark' | 'auto';
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
