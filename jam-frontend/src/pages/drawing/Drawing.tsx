import React from "react";
import styles from "./drawing.module.css";
import DisplayCanvas from "../../components/canvas/DisplayCanvas.tsx";
import ToolBar from "../../components/toolbar/Toolbar.tsx";
import { DrawingState } from "./types.ts";

class Drawing extends React.Component<any, DrawingState> {
    displayCanvasRef: React.RefObject<DisplayCanvas>

    constructor(props) {
        super(props);
        this.state = {
            color: this.randomColor(),
            weight: Math.floor(Math.random() * 32 + 1)
        };
        this.displayCanvasRef = React.createRef();
    }

    randomColor() {
        // Generate random values for red, green, and blue components
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);

        // Convert the values to hexadecimal and ensure they have two digits
        const redHex = red.toString(16).padStart(2, '0');
        const greenHex = green.toString(16).padStart(2, '0');
        const blueHex = blue.toString(16).padStart(2, '0');

        // Concatenate the values to form the final color string
        const color = `#${redHex}${greenHex}${blueHex}`;

        return color;
    }

    updateColor(color: string) {
        this.setState({ ...this.state, color });
    }

    updateWeight(weight: number) {
        this.setState({ ...this.state, weight });
    }

    onSave() {
        this.displayCanvasRef?.current?.save();
    }

    onClear() {
        this.displayCanvasRef.current?.clear();
    }

    render() {
        return <div className={styles.container}>
            <ToolBar initialColor={this.state.color} initialWeight={this.state.weight} onClear={this.onClear.bind(this)} onSave={this.onSave.bind(this)} onColorChange={this.updateColor.bind(this)} onWeightChange={this.updateWeight.bind(this)} />
            <DisplayCanvas canvasId="658d0430e60c940aafd747df" ref={this.displayCanvasRef} currentColor={this.state.color} currentWeight={this.state.weight} />
        </div>
    }
}

export default Drawing
