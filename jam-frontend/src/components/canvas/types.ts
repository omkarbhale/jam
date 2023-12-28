export type DisplayCanvasState = {
    img?: any
    strokes: Stroke[]
    // currentStroke?: Stroke
    currentStrokes: { [index: string]: (Stroke | undefined) };
}

export type DisplayCanvasProps = {
    canvasId: string
    currentColor: string,
    currentWeight: number
}

export type Cursor = {
    x: number,
    y: number,
    weight: number,
    color: string
    hidden: boolean
}

export type Stroke = {
    points: {x: number, y: number}[]
    color: string
    weight: number
    id: String
}
