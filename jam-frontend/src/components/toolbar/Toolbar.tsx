import React from "react"
import styles from "./toolbar.module.css";
import { ToolBarProps, ToolBarState } from "./types";

class ToolBar extends React.Component<ToolBarProps, ToolBarState> {

    constructor(props) {
        super(props);
        this.state = {
            color: props.initialColor,
            weight: props.initialWeight
        }
    }

    onColorChange(e) {
        this.setState({...this.state, color: e.target.value});
        this.props.onColorChange(e.target.value);
    }

    onWeightChange(e) {
        this.setState({...this.state, weight: e.target.value});
        this.props.onWeightChange(e.target.value);
    }

    onSave(e) {
        this.props.onSave();
    }

    onClear(e) {
        this.props.onClear();
    }

    render() {
        return <div className={styles.toolbar}>
            <div className={styles.top}>
                <input type="color" name="color" id="color" defaultValue={this.state.color} onChange={this.onColorChange.bind(this)} />
                <input type="range" name="weight" id="weight" defaultValue={this.state.weight} min={1} max={32} onChange={this.onWeightChange.bind(this)} />
                <div>{this.state.weight}</div>
            </div>
            <div className={styles.bottom}>
                <button onClick={this.onClear.bind(this)}>Clear</button>
                <button onClick={this.onSave.bind(this)}>Save</button>
            </div>
        </div>
    }
}

export default ToolBar