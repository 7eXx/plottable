///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  enum ClickState {NotClicked, SingleClicked, DoubleClicked};
  export class DoubleClick extends Interaction {

    private _mouseDispatcher: Plottable.Dispatchers.Mouse;
    private _touchDispatcher: Plottable.Dispatchers.Touch;
    private _clickState = ClickState.NotClicked;
    private _clickedDown = false;
    private _clickedPoint: Point;

    private _onDoubleClickCallbacks = new Utils.CallbackSet<ClickCallback>();

    private _mouseDownCallback = (p: Point) => this._handleClickDown(p);
    private _mouseUpCallback = (p: Point) => this._handleClickUp(p);
    private _dblClickCallback = (p: Point) => this._handleDblClick();
    private _touchStartCallback = (ids: any, idToPoint: any) => this._handleClickDown(idToPoint[ids[0]]);
    private _touchEndCallback = (ids: any, idToPoint: any) => this._handleClickUp(idToPoint[ids[0]]);
    private _touchCancelCallback = (ids: any, idToPoint: any) => this._handleClickCancel();

    protected _anchor(component: Component) {
      super._anchor(component);

      this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown(this._mouseDownCallback);
      this._mouseDispatcher.onMouseUp(this._mouseUpCallback);
      this._mouseDispatcher.onDblClick(this._dblClickCallback);

      this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart(this._touchStartCallback);
      this._touchDispatcher.onTouchEnd(this._touchEndCallback);
      this._touchDispatcher.onTouchCancel(this._touchCancelCallback);
    }

    private _handleClickDown(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._isInsideComponent(translatedP)) {
        if (!(this._clickState === ClickState.SingleClicked) || !DoubleClick.pointsEqual(translatedP, this._clickedPoint)) {
          this._clickState = ClickState.NotClicked;
        }
        this._clickedPoint = translatedP;
        this._clickedDown = true;
      }
    }

    private _handleClickUp(p: Point) {
      var translatedP = this._translateToComponentSpace(p);
      if (this._clickedDown && DoubleClick.pointsEqual(translatedP, this._clickedPoint)) {
        this._clickState = this._clickState === ClickState.NotClicked ? ClickState.SingleClicked : ClickState.DoubleClicked;
      } else {
        this._clickState = ClickState.NotClicked;
      }
      this._clickedDown = false;
    }

    private _handleDblClick() {
      if (this._clickState === ClickState.DoubleClicked) {
        this._onDoubleClickCallbacks.callCallbacks(this._clickedPoint);
        this._clickState = ClickState.NotClicked;
      }
    }

    private _handleClickCancel() {
      this._clickState = ClickState.NotClicked;
      this._clickedDown = false;
    }

    private static pointsEqual(p1: Point, p2: Point) {
      return p1.x === p2.x && p1.y === p2.y;
    }

    /**
     * Sets the callback called when the Component is double-clicked.
     *
     * @param {ClickCallback} callback The callback to set.
     * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
     */
    public onDoubleClick(callback: ClickCallback) {
      this._onDoubleClickCallbacks.add(callback);
      return this;
    }

    /**
     * Removes the callback called when the Component is double-clicked.
     *
     * @param {ClickCallback} callback The callback to remove.
     * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
     */
    public offDoubleClick(callback: ClickCallback) {
      this._onDoubleClickCallbacks.delete(callback);
      return this;
    }
  }
}
}
