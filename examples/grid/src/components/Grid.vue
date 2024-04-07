<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Emitter, Event } from '@whale/code/common/event'
import { Grid, IView, Sizing, Direction } from '@whale/code/ui/grid'
import '@whale/code/ui/grid-view.css'
import '@whale/code/ui/sash.css'
import '@whale/code/ui/split-view.css'
import '@whale/code/ui/scrollbar.css'

class TestView implements IView {
  private readonly _onDidChange = new Emitter<
    { width: number; height: number } | undefined
  >()
  readonly onDidChange = this._onDidChange.event

  get minimumWidth(): number {
    return this._minimumWidth
  }
  set minimumWidth(size: number) {
    this._minimumWidth = size
    this._onDidChange.fire(undefined)
  }

  get maximumWidth(): number {
    return this._maximumWidth
  }
  set maximumWidth(size: number) {
    this._maximumWidth = size
    this._onDidChange.fire(undefined)
  }

  get minimumHeight(): number {
    return this._minimumHeight
  }
  set minimumHeight(size: number) {
    this._minimumHeight = size
    this._onDidChange.fire(undefined)
  }

  get maximumHeight(): number {
    return this._maximumHeight
  }
  set maximumHeight(size: number) {
    this._maximumHeight = size
    this._onDidChange.fire(undefined)
  }

  private _element: HTMLElement = document.createElement('div')
  get element(): HTMLElement {
    this._onDidGetElement.fire()
    return this._element
  }

  private readonly _onDidGetElement = new Emitter<void>()
  readonly onDidGetElement = this._onDidGetElement.event

  private _width = 0
  get width(): number {
    return this._width
  }

  private _height = 0
  get height(): number {
    return this._height
  }

  private _top = 0
  get top(): number {
    return this._top
  }

  private _left = 0
  get left(): number {
    return this._left
  }

  get size(): [number, number] {
    return [this.width, this.height]
  }

  private readonly _onDidLayout = new Emitter<{
    width: number
    height: number
    top: number
    left: number
  }>()
  readonly onDidLayout: Event<{
    width: number
    height: number
    top: number
    left: number
  }> = this._onDidLayout.event

  private readonly _onDidFocus = new Emitter<void>()
  readonly onDidFocus: Event<void> = this._onDidFocus.event

  constructor(
    private _minimumWidth: number,
    private _maximumWidth: number,
    private _minimumHeight: number,
    private _maximumHeight: number
  ) {}

  layout(width: number, height: number, top: number, left: number): void {
    this._width = width
    this._height = height
    this._top = top
    this._left = left
    this._onDidLayout.fire({ width, height, top, left })
  }

  focus(): void {
    this._onDidFocus.fire()
  }

  dispose(): void {
    this._onDidChange.dispose()
    this._onDidGetElement.dispose()
    this._onDidLayout.dispose()
    this._onDidFocus.dispose()
  }
}

const view1 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE)
view1.element.style.backgroundColor = 'pink'
view1.element.style.height = '100%'

const grid = new Grid(view1)

const view2 = new TestView(50, Number.MAX_VALUE, 50, Number.MAX_VALUE)
view2.element.style.backgroundColor = 'skyblue'
view2.element.style.height = '100%'
grid.addView(view2, Sizing.Distribute, view1, Direction.Right)

const container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  container.value?.appendChild(grid.element)

  grid.layout(800, 600)
})
</script>

<template>
  <div ref="container" class="grid-container"></div>
</template>

<style scoped>
.grid-container {
  width: 800px;
  height: 600px;
}
</style>
