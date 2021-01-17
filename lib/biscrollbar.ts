import { Emitter } from '@orange4glace/vs-lib/base/common/event';
import "./style.scss";

export class BiScrollbar {

  private readonly onUpdate_ = new Emitter<void>();
  readonly onUpdate = this.onUpdate_.event;
  private readonly onChange_ = new Emitter<void>();
  readonly onChange = this.onChange_.event;

  public pivot: number;
  public pivottingOnlyPivotVisible: boolean;
  
  private scrollSize_: number;
  get scrollSize() { return this.scrollSize_; }

  private scrollLow_: number;
  private scrollHigh_: number;

  private size_: number;
  private start_: number;
  get start() { return this.start_; }
  private end_: number;
  get end() { return this.end_; }

  private el_: HTMLElement;
  private scrollEl_: HTMLElement;
  private handleLEl_: HTMLElement;
  private handleREl_: HTMLElement;

  private lastMousePos_: [number, number];

  constructor(
    parent: HTMLElement
  ) {
    this.el_ = document.createElement('div');
    this.el_.classList.add('o-biscrollbar')
    this.el_.innerHTML = `
      <div class="o-biscrollbar-scrollbar">
        <div class="o-biscrollbar-handle o-biscrollbar-handle-left"></div>
        <div class="o-biscrollbar-handle o-biscrollbar-handle-right"></div>
      </div>
    `;
    this.scrollEl_ = this.el_.querySelector('.o-biscrollbar-scrollbar');
    this.handleLEl_ = this.el_.querySelector('.o-biscrollbar-handle-left');
    this.handleREl_ = this.el_.querySelector('.o-biscrollbar-handle-right');
    parent.append(this.el_);

    this.handleHandleMousemove = this.handleHandleMousemove.bind(this);
    this.handleBarMousedown = this.handleBarMousedown.bind(this);
    this.handleBarMousemove = this.handleBarMousemove.bind(this);
    this.handleLEl_.addEventListener('mousedown', this.handleHandleMousedown.bind(this, 'left'));
    this.handleREl_.addEventListener('mousedown', this.handleHandleMousedown.bind(this, 'right'));
    this.scrollEl_.addEventListener('mousedown', this.handleBarMousedown);
  }

  setSize(size: number) {
    this.size_ = size;
    this.update();
  }

  setRagne(start: number, end: number) {
    this.start_ = start;
    this.end_ = end;
    this.update();
  }

  layout(width: number, height: number) {
    const size = width;
    const orthogonalSize = height;
    const sizeStyleName = 'width';
    const orthogonalSizeStyleName = 'height';
    this.scrollSize_ = size;
    this.scrollEl_.style.borderRadius = `${orthogonalSize}px`;
    this.handleLEl_.style.borderWidth = `${orthogonalSize / 4}px`;
    this.handleLEl_.style[orthogonalSizeStyleName] = `100%`;
    this.handleLEl_.style[sizeStyleName] = `${orthogonalSize}px`;
    this.handleREl_.style.borderWidth = `${orthogonalSize / 4}px`;
    this.handleREl_.style[orthogonalSizeStyleName] = `100%`;
    this.handleREl_.style[sizeStyleName] = `${orthogonalSize}px`;
    this.update();
  }

  update() {
    this.scrollSize_ = this.el_.offsetWidth;
    const f = (this.end_ - this.start_);
    const m = Math.log2(f / this.size_ + 1);
    const c = this.scrollSize_ * m;
    const a = (this.scrollSize_ - c) == 0 ? 0 : (this.scrollSize_ - c) * (this.start_ / (this.size_ - f));
    this.scrollLow_ = a;
    this.scrollHigh_ = a + c;
    this.scrollEl_.style.left = `${Math.round(a)}px`;
    this.scrollEl_.style.width = `${Math.round(c)}px`;
    this.onUpdate_.fire();
  }

  private scrollSizeToValueSize(scrollSize: number) {
    return this.size_ * (Math.pow(2, scrollSize / this.scrollSize_) - 1);
  }

  private scrollBarPositionToValueRange(scrollLow: number, scrollHigh: number) {
    const scrollbarSize = scrollHigh - scrollLow;
    const valueSize = this.scrollSizeToValueSize(scrollbarSize);
    const start = (this.scrollSize_ - scrollbarSize == 0) ? 0 : (this.size_ - valueSize) / (this.scrollSize_ - scrollbarSize) * scrollLow;
    const end = start + valueSize;
    return [start, end];
  }

  private handleBarMousedown(e: MouseEvent) {
    this.lastMousePos_ = [e.screenX, e.screenY];
    const mouseup = () => {
    console.log(5);
      document.removeEventListener('mousemove', this.handleBarMousemove);
      document.removeEventListener('mouseup', mouseup);
    }
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', this.handleBarMousemove);
  }

  private handleBarMousemove(e: MouseEvent) {
    const deltaMousePos = [e.screenX - this.lastMousePos_[0], e.screenY - this.lastMousePos_[1]];
    this.lastMousePos_ = [e.screenX, e.screenY];
    const maxDeltaPos = deltaMousePos[0];
    const deltaPos = Math.max(-this.scrollLow_, Math.min(this.scrollSize_ - this.scrollHigh_, maxDeltaPos));
    const nextScrollLow = this.scrollLow_ + deltaPos;
    const nextScrollHigh = this.scrollHigh_ + deltaPos;
    console.log(nextScrollLow, nextScrollHigh);
    const valueRange = this.scrollBarPositionToValueRange(nextScrollLow, nextScrollHigh);
    [this.start_, this.end_] = valueRange;
    this.update();
    this.onChange_.fire();
  }

  private handleHandleMousedown(handleDirection: 'left' | 'right', e: MouseEvent) {
    this.lastMousePos_ = [e.screenX, e.screenY];
    const mousemove = this.handleHandleMousemove.bind(this, handleDirection);
    const mouseup = () => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    }
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', mousemove);
  }

  private handleHandleMousemove(handleDirection: 'left' | 'right', e: MouseEvent) {
    const MIN_SIZE = 50;

    const deltaMousePos = [e.screenX - this.lastMousePos_[0], e.screenY - this.lastMousePos_[1]];
    this.lastMousePos_ = [e.screenX, e.screenY];
    const deltaPos = deltaMousePos[0] * (handleDirection === 'right' ? 1 : -1);
    const expanding = (deltaPos >= 0 ? 1 : -1);
    const currentScrollbarSize = this.scrollHigh_ - this.scrollLow_;
    const nextScrollbarSize = Math.max(MIN_SIZE, Math.min(this.scrollSize, currentScrollbarSize + deltaPos * 2));

    const nextValueSize = this.scrollSizeToValueSize(nextScrollbarSize);
    const maxDelta = Math.abs((nextValueSize - (this.end_ - this.start_)) / 2);

    let startDelta = Math.max(-this.start_, expanding * -1 * maxDelta);
    let endDelta = Math.min(this.size_ - this.end_, expanding * maxDelta);

    const center = (this.start_ + this.end_) / 2;
    let pivot = this.pivot;

    if (this.pivot === undefined ||
       (this.pivottingOnlyPivotVisible && pivot < this.start_ || this.end_ < pivot)) {
      pivot = center;
    }

    if (pivot < center) {
      if (expanding == 1) {
        const pivotDelta = Math.min(this.start_, Math.min(endDelta, center - pivot));
        startDelta -= pivotDelta;
        endDelta -= pivotDelta;
      }
      else {
        const pivotDelta = Math.min(startDelta, center - pivot);
        startDelta -= pivotDelta;
        endDelta -= pivotDelta;
      }
    }
    else {
      if (expanding == 1) {
        const pivotDelta = Math.min(this.size_ - this.end_, Math.min(-startDelta, pivot - center));
        startDelta += pivotDelta;
        endDelta += pivotDelta;
      }
      else {
        const pivotDelta = Math.min(-endDelta, pivot - center);
        startDelta += pivotDelta;
        endDelta += pivotDelta;
      }
    }

    const nextStart = this.start_ + startDelta;
    const nextEnd = this.end_ + endDelta;

    this.start_ = (nextStart);
    this.end_ = (nextEnd);
    this.start_ = Math.max(0, Math.min(this.size_, this.start_));
    this.end_ = Math.max(0, Math.min(this.size_, this.end_));
    this.update();
    this.onChange_.fire();
  }

}