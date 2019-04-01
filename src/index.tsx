import * as React from "react";
import { DraggableEventHandler } from "react-draggable"
import Resizable, { ResizableDirection } from "re-resizable";

// FIXME: https://github.com/mzabriskie/react-draggable/issues/381
//         I can not find `scale` too...
type $TODO = any;
const Draggable = require("react-draggable");

export type Grid = [number, number];

export type Position = {
  x: number;
  y: number;
};

export type DraggableData = {
  node: HTMLElement;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
} & Position;

export type RndDragCallback = DraggableEventHandler;

export type RndDragEvent =
  | React.MouseEvent<HTMLElement | SVGElement>
  | React.TouchEvent<HTMLElement | SVGElement>
  | MouseEvent
  | TouchEvent;

export type RndResizeStartCallback = (
  e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  dir: ResizableDirection,
  elementRef: HTMLDivElement,
) => void;

export type ResizableDelta = {
  width: number;
  height: number;
};

export type RndResizeCallback = (
  e: MouseEvent | TouchEvent,
  dir: ResizableDirection,
  elementRef: HTMLDivElement,
  delta: ResizableDelta,
  position: Position,
) => void;

type Size = {
  width: string | number;
  height: string | number;
};

type Bounds = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type State = {
  original: Position;
  bounds: Bounds;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

type MaxSize = {
  maxWidth: number | string;
  maxHeight: number | string;
}

export type ResizeEnable = {
  bottom?: boolean;
  bottomLeft?: boolean;
  bottomRight?: boolean;
  left?: boolean;
  right?: boolean;
  top?: boolean;
  topLeft?: boolean;
  topRight?: boolean;
};

export type HandleClasses = {
  bottom?: string;
  bottomLeft?: string;
  bottomRight?: string;
  left?: string;
  right?: string;
  top?: string;
  topLeft?: string;
  topRight?: string;
};

export type HandleStyles = {
  bottom?: React.CSSProperties;
  bottomLeft?: React.CSSProperties;
  bottomRight?: React.CSSProperties;
  left?: React.CSSProperties;
  right?: React.CSSProperties;
  top?: React.CSSProperties;
  topLeft?: React.CSSProperties;
  topRight?: React.CSSProperties;
};

export interface Props {
  dragGrid?: Grid;
  default?: {
    x: number;
    y: number;
  } & Size;
  position?: {
    x: number;
    y: number;
  };
  size?: Size;
  resizeGrid?: Grid;
  bounds?: Bounds;
  onMouseDown?: (e: MouseEvent) => void;
  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeStop?: RndResizeCallback;
  onDragStart?: RndDragCallback;
  onDrag?: RndDragCallback;
  onDragStop?: RndDragCallback;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  enableResizing?: ResizeEnable;
  resizeHandleClasses?: HandleClasses;
  resizeHandleStyles?: HandleStyles;
  resizeHandleWrapperClass?: string;
  resizeHandleWrapperStyle?: React.CSSProperties;
  lockAspectRatio?: boolean | number;
  lockAspectRatioExtraWidth?: number;
  lockAspectRatioExtraHeight?: number;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  dragAxis?: "x" | "y" | "both" | "none";
  dragHandleClassName?: string;
  disableDragging?: boolean;
  cancel?: string;
  enableUserSelectHack?: boolean;
  scale?: number;
  [key: string]: any;
}

const resizableStyle = {
  width: "auto" as "auto",
  height: "auto" as "auto",
  display: "inline-block" as "inline-block",
  position: "absolute" as "absolute",
  top: 0,
  left: 0,
};

interface DefaultProps {
  maxWidth: number;
  maxHeight: number;
  onResizeStart: RndResizeStartCallback;
  onResize: RndResizeCallback;
  onResizeStop: RndResizeCallback;
  onDragStart: RndDragCallback;
  onDrag: RndDragCallback;
  onDragStop: RndDragCallback;
  scale: number;
}

export class Rnd extends React.Component<Props, State> {
  public static defaultProps: DefaultProps = {
    maxWidth: Number.MAX_SAFE_INTEGER,
    maxHeight: Number.MAX_SAFE_INTEGER,
    scale: 1,
    onResizeStart: () => {},
    onResize: () => {},
    onResizeStop: () => {},
    onDragStart: () => {},
    onDrag: () => {},
    onDragStop: () => {},
  };
  resizable!: Resizable;
  draggable!: $TODO; // Draggable;
  isResizing = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      original: {
        x: 0,
        y: 0,
      },
      bounds: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight,
    };

    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.getMaxSizesFromProps = this.getMaxSizesFromProps.bind(this);
  }

  componentDidMount() {
    const { left, top } = this.getOffsetFromParent();
    const { x, y } = this.getDraggablePosition();
    this.draggable.setState({
      x: x - left,
      y: y - top,
    });
    // HACK: Apply position adjustment
    this.forceUpdate();
  }

  // HACK: To get `react-draggable` state x and y.
  getDraggablePosition(): { x: number; y: number } {
    const { x, y } = (this.draggable as any).state;
    return { x, y };
  }

  getParent() {
    return this.resizable && (this.resizable as any).parentNode;
  }

  getParentSize(): { width: number; height: number } {
    return (this.resizable as any).getParentSize();
  }

  getMaxSizesFromProps(): MaxSize {
    const maxWidth = typeof this.props.maxWidth === "undefined" ? Number.MAX_SAFE_INTEGER : this.props.maxWidth;
    const maxHeight = typeof this.props.maxHeight === "undefined" ? Number.MAX_SAFE_INTEGER : this.props.maxHeight;
    return { maxWidth, maxHeight };
  }

  getSelfElement(): Element {
    return this.resizable && this.resizable.resizable;
  }

  getOffsetHeight(boundary: HTMLElement) {
    // const scale = this.props.scale as number;
    return boundary.offsetHeight;
  }

  getOffsetWidth(boundary: HTMLElement) {
    // const scale = this.props.scale as number;
    return boundary.offsetWidth;
  }

  onDragStart(e: RndDragEvent, data: DraggableData) {
    if (this.props.onDragStart) {
      this.props.onDragStart(e, data);
    }
    if (!this.props.bounds) return;
    return this.setState({ bounds: this.props.bounds })
  }

  onDrag(e: RndDragEvent, data: DraggableData) {
    if (this.props.onDrag) {
      const offset = this.getOffsetFromParent()
      const newX = Math.min(data.x, 0) - offset.left
      const newY = Math.min(data.y, 0) - offset.top
      this.props.onDrag(e, { 
        ...data,
        x: newX,
        y: newY,
      })
    }
  }

  onDragStop(e: RndDragEvent, data: DraggableData) {
    if (this.props.onDragStop) {
      const { left, top } = this.getOffsetFromParent();
      return this.props.onDragStop(e, { ...data, x: data.x + left, y: data.y + top });
    }
  }

  onResizeStart(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    dir: ResizableDirection,
    elementRef: HTMLDivElement,
  ) {
    e.stopPropagation();
    this.isResizing = true;
    // const scale = this.props.scale as number;
    this.setState({
      original: this.getDraggablePosition(),
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight,
    });
    if (this.props.onResizeStart) {
      this.props.onResizeStart(e, dir, elementRef);
    }
  }

  onResize(
    e: MouseEvent | TouchEvent,
    direction: ResizableDirection,
    elementRef: HTMLDivElement,
    delta: { height: number; width: number },
  ) {
    let x;
    let y;
    const offset = this.getOffsetFromParent();
    if (/left/i.test(direction)) {
      x = this.state.original.x - delta.width;
      // INFO: If uncontrolled component, apply x position by resize to draggable.
      if (!this.props.position) {
        this.draggable.setState({ x });
      }
      x += offset.left;
    }
    if (/top/i.test(direction)) {
      y = this.state.original.y - delta.height;
      // INFO: If uncontrolled component, apply y position by resize to draggable.
      if (!this.props.position) {
        this.draggable.setState({ y });
      }
      y += offset.top;
    }
    if (this.props.onResize) {
      if (typeof x === "undefined") {
        x = this.getDraggablePosition().x + offset.left;
      }
      if (typeof y === "undefined") {
        y = this.getDraggablePosition().y + offset.top;
      }
      this.props.onResize(e, direction, elementRef, delta, {
        x,
        y,
      });
    }
  }

  onResizeStop(
    e: MouseEvent | TouchEvent,
    direction: ResizableDirection,
    elementRef: HTMLDivElement,
    delta: { height: number; width: number },
  ) {
    this.isResizing = false;
    const { maxWidth, maxHeight } = this.getMaxSizesFromProps();
    this.setState({ maxWidth, maxHeight });
    if (this.props.onResizeStop) {
      const position: Position = this.getDraggablePosition();
      this.props.onResizeStop(e, direction, elementRef, delta, position);
    }
  }

  updateSize(size: { width: number | string; height: number | string }) {
    if (!this.resizable) return;
    this.resizable.updateSize({ width: size.width, height: size.height });
  }

  updatePosition(position: Position) {
    this.draggable.setState(position);
  }

  getOffsetFromParent(): { top: number; left: number } {
    const scale = this.props.scale as number;
    const parent = this.getParent();
    if (!parent) {
      return {
        top: 0,
        left: 0,
      };
    }
    const parentRect = parent.getBoundingClientRect();
    const parentLeft = parentRect.left;
    const parentTop = parentRect.top;
    const selfRect = this.getSelfElement().getBoundingClientRect();
    const position = this.getDraggablePosition();
    return {
      left: selfRect.left - parentLeft - position.x * scale,
      top: selfRect.top - parentTop - position.y * scale,
    };
  }

  render() {
    const {
      disableDragging,
      style,
      dragHandleClassName,
      position,
      onMouseDown,
      dragAxis,
      dragGrid,
      bounds,
      enableUserSelectHack,
      cancel,
      children,
      onResizeStart,
      onResize,
      onResizeStop,
      onDragStart,
      onDrag,
      onDragStop,
      resizeHandleStyles,
      resizeHandleClasses,
      enableResizing,
      resizeGrid,
      resizeHandleWrapperClass,
      resizeHandleWrapperStyle,
      scale,
      ...resizableProps
    } = this.props;
    const defaultValue = this.props.default ? { ...this.props.default } : undefined;
    // Remove unknown props, see also https://reactjs.org/warnings/unknown-prop.html
    delete resizableProps.default;

    const cursorStyle = disableDragging || dragHandleClassName ? { cursor: "auto" } : { cursor: "move" };
    const innerStyle = {
      ...resizableStyle,
      ...cursorStyle,
      ...style,
    };
    const { left, top } = this.getOffsetFromParent();
    let draggablePosition;
    if (position) {
      draggablePosition = {
        x: position.x - left,
        y: position.y - top,
      };
    }
    return (
      <Draggable
        ref={(c: $TODO) => {
          if (!c) return;
          this.draggable = c;
        }}
        handle={dragHandleClassName ? `.${dragHandleClassName}` : undefined}
        defaultPosition={defaultValue}
        onMouseDown={onMouseDown}
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        axis={dragAxis}
        disabled={disableDragging}
        grid={dragGrid}
        bounds={bounds ? this.state.bounds : undefined}
        position={draggablePosition}
        enableUserSelectHack={enableUserSelectHack}
        cancel={cancel}
        scale={scale}
      >
        <Resizable
          {...resizableProps}
          ref={c => {
            if (c) {
              this.resizable = c;
            }
          }}
          defaultSize={defaultValue}
          size={this.props.size}
          enable={enableResizing}
          onResizeStart={this.onResizeStart}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          style={innerStyle}
          minWidth={this.props.minWidth}
          minHeight={this.props.minHeight}
          maxWidth={this.isResizing ? this.state.maxWidth : this.props.maxWidth}
          maxHeight={this.isResizing ? this.state.maxHeight : this.props.maxHeight}
          grid={resizeGrid}
          handleWrapperClass={resizeHandleWrapperClass}
          handleWrapperStyle={resizeHandleWrapperStyle}
          lockAspectRatio={this.props.lockAspectRatio}
          lockAspectRatioExtraWidth={this.props.lockAspectRatioExtraWidth}
          lockAspectRatioExtraHeight={this.props.lockAspectRatioExtraHeight}
          handleStyles={resizeHandleStyles}
          handleClasses={resizeHandleClasses}
          scale={this.props.scale}
        >
          {children}
        </Resizable>
      </Draggable>
    );
  }
}
