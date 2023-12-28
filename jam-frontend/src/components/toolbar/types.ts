export type ToolBarProps = {
    initialColor: string
    initialWeight: number
    onSave: () => void
    onClear: () => void
    onColorChange: (color: string) => void
    onWeightChange: (weight: number) => void
}

export type ToolBarState = {
    color: string,
    weight: number
};
