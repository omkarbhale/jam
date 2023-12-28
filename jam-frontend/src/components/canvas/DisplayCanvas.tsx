import React from "react";
import p5 from "p5";
import _ from "lodash"
import styles from "./canvas.module.css";
import { Cursor, DisplayCanvasProps, DisplayCanvasState, Stroke } from "./types.ts";
import { self } from "../../services/api/auth/auth.ts";
import { Person } from "../../services/api/auth/types.ts";

import { addAndRemoveCanvasStroke, getCanvas, clearCanvas, updateImage } from "../../services/api/canvas/canvas.ts";
import { base64ToImage, imageToBase64 } from "./utils/converter.ts";
import { socket } from "../../services/sockets/sockets.ts";

class DisplayCanvas extends React.Component<DisplayCanvasProps, DisplayCanvasState> {
    width: number
    height: number
    backgroundColor: string

    canvasContainerRef: React.RefObject<HTMLDivElement>
    p5: any
    redoStack: Stroke[]
    canvasId: string
    self: Person
    cursors: { [index: string]: Cursor }

    // TODO: remove this
    fixedImgRef: React.RefObject<HTMLCanvasElement>

    constructor(props: DisplayCanvasProps) {
        super(props);
        this.width = 960;
        this.height = 720;
        this.backgroundColor = '#323232';

        this.canvasId = props.canvasId;
        this.self = self();
        this.state = {
            img: null,
            strokes: [],
            currentStrokes: {}
        }
        this.redoStack = [];

        this.cursors = {};

        this.canvasContainerRef = React.createRef();
        this.fixedImgRef = React.createRef();
        this.handleMouseMove = _.throttle(this.handleMouseMove, 0).bind(this);
    }

    handleKeyPress(e: KeyboardEvent) {
        if (!e.ctrlKey) return;
        if (e.key === '\x1A') this.undo();
        if (e.key === '\x19') this.redo();
    }


    handleMouseMove(e) {
        socket.emit('cursor-move', {
            id: self().id,
            cursor: {
                color: this.props.currentColor,
                weight: this.props.currentWeight,
                x: this.p5.mouseX,
                y: this.p5.mouseY,
                hidden: !(this.p5.mouseX >= 0 && this.p5.mouseY >= 0 && this.p5.mouseX < this.width && this.p5.mouseY < this.height)
            }
        });
    }

    async componentDidMount(): Promise<void> {
        this.p5 = new p5(this.sketch.bind(this), this.canvasContainerRef.current);

        socket.on("cursor-move", (data) => {
            this.cursors[data.id] = data.cursor;
        });

        socket.on("stroke-new", (stroke) => {
            this.setState({ ...this.state, strokes: [...this.state.strokes, stroke] });
        })

        socket.on("stroke-current", (data) => {
            const newCurrentStrokes = this.state.currentStrokes;
            newCurrentStrokes[data.id] = data.stroke;
            this.setState({ ...this.state, currentStrokes: newCurrentStrokes });
        })

        socket.on("img-change", async (base64) => {
            this.state.img.image(await base64ToImage(base64, this.p5));
            this.setState({});
        })

        document.addEventListener('keypress', this.handleKeyPress.bind(this));
    }

    componentWillUnmount(): void {
        this.p5.remove();
        document.removeEventListener('keypress', this.handleKeyPress.bind(this));
    }

    save() {
        const image = this.p5.canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = "jam.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    clear() {
        console.log('clearing area')

        const newCurrentStrokes = this.state.currentStrokes;
        newCurrentStrokes[self().id] = undefined;
        this.setState({ ...this.state, strokes: [], currentStrokes: newCurrentStrokes });
        this.state.img?.background(this.backgroundColor);
        this.redoStack = []

        socket.emit("stroke-current", { id: self().id, stroke: undefined });
        clearCanvas(this.canvasId);
    }

    sketch(p5) {
        const drawStroke = (graphic, stroke: Stroke) => {
            if (!graphic) throw new Error("No graphic");
            if (stroke.points.length <= 0) return;
            graphic.stroke(stroke.color)
            graphic.strokeWeight(stroke.weight)
            graphic.point(stroke.points[0].x, stroke.points[0].y); // If stroke is only one point
            for (let i = 0; i < stroke.points.length - 1; i++) {
                graphic.line(stroke.points[i].x, stroke.points[i].y, stroke.points[i + 1].x, stroke.points[i + 1].y);
            }
        }

        p5.setup = async () => {
            p5.createCanvas(this.width, this.height);
            p5.canvas.addEventListener("contextmenu", (e) => { e.preventDefault() }); // disable context menu
            p5.frameRate(144);
            p5.background(50);
            p5.noFill();
            p5.pixelDensity(1)

            const graphics = p5.createGraphics(this.width, this.height, this.fixedImgRef.current);
            graphics.background(this.backgroundColor);

            const canvas = await getCanvas(this.props.canvasId);
            if (canvas && canvas.img) {
                const _img = await base64ToImage(canvas.img, p5);
                graphics.image(_img, 0, 0);
            }

            this.setState({ ...this.state, strokes: canvas?.strokes || [], img: graphics });
        }


        p5.draw = () => {
            p5.background(this.backgroundColor);
            if (this.state.img) {
                p5.image(this.state.img, 0, 0);
            }
            for (let stroke of this.state.strokes) {
                drawStroke(p5, stroke);
            }
            if (this.state.currentStrokes[self().id]) {
                drawStroke(p5, this.state.currentStrokes[self().id]!);
            }

            p5.stroke(this.props.currentColor);
            p5.strokeWeight(this.props.currentWeight);
            p5.point(p5.mouseX, p5.mouseY);
            // Cursors
            for (const id in this.cursors) {
                if (this.cursors[id].hidden) return;
                p5.stroke(this.cursors[id].color);
                p5.strokeWeight(this.cursors[id].weight);
                p5.point(this.cursors[id].x, this.cursors[id].y);
            }
        }

        p5.mousePressed = () => {
            if (p5.mouseButton !== p5.LEFT) return;

            const newCurrentStrokes = this.state.currentStrokes;
            newCurrentStrokes[self().id] = {
                id: self().id,
                color: this.props.currentColor,
                weight: this.props.currentWeight,
                points: []
            }

            this.setState({
                ...this.state,
                currentStrokes: newCurrentStrokes
            })
            p5.stroke(this.props.currentColor)
            p5.strokeWeight(this.props.currentWeight);
        }

        p5.mouseReleased = () => {
            if (!this.state.currentStrokes[self().id]) return;
            if (p5.mouseX >= 0 && p5.mouseX < this.width && p5.mouseY >= 0 && p5.mouseY < this.height)
                this.state.currentStrokes[self().id]!.points.push({ x: p5.mouseX, y: p5.mouseY });

            if (this.state.currentStrokes[self().id]!.points.length <= 0) return;

            p5.point(p5.mouseX, p5.mouseY);

            // If my strokes are more than 5 append least recent to img
            let numSelfStrokes = this.state.strokes.reduce((acc, stroke) => stroke.id === this.self.id ? (acc + 1) : acc, 1);
            const newStrokes = [...this.state.strokes, this.state.currentStrokes[self().id]!];
            let imageUpdated = false;
            let strokesToRemove: number[] = [];
            while (numSelfStrokes > 5) {
                const firstSelfStrokeIndex = this.state.strokes.findIndex((stroke) => stroke.id === this.self.id);
                drawStroke(this.state.img, this.state.strokes[firstSelfStrokeIndex]);
                socket.emit("img-change", imageToBase64(this.state.img))    ;
                newStrokes.splice(firstSelfStrokeIndex, 1);
                // removeCanvasStroke(this.id, firstSelfStrokeIndex);
                strokesToRemove.push(firstSelfStrokeIndex);
                numSelfStrokes--;
                imageUpdated = true;
            }

            if (imageUpdated)
                updateImage(this.canvasId, imageToBase64(this.state.img));

            // Update server
            addAndRemoveCanvasStroke(this.props.canvasId, this.state.currentStrokes[self().id], strokesToRemove);
            console.log('emmiting new stroke')
            socket.emit('stroke-new', this.state.currentStrokes[self().id]);
            socket.emit('stroke-removed', { id: self().id, stroke: undefined });

            const newCurrentStrokes = this.state.currentStrokes;
            newCurrentStrokes[self().id] = undefined;

            this.setState({
                ...this.state,
                strokes: newStrokes,
                currentStrokes: newCurrentStrokes
            });
            this.redoStack = [];
        }

        p5.mouseDragged = () => {
            if (p5.mouseButton !== p5.LEFT) return;
            if (this.state.currentStrokes[self().id]?.points && this.state.currentStrokes[self().id]!.points.length > 0) {
                if (p5.dist(
                    p5.mouseX,
                    p5.mouseY,
                    this.state.currentStrokes[self().id]!.points[this.state.currentStrokes[self().id]!.points.length - 1].x,
                    this.state.currentStrokes[self().id]!.points[this.state.currentStrokes[self().id]!.points.length - 1].y
                ) > 10) {
                    this.state.currentStrokes[self().id]?.points.push({ x: p5.mouseX, y: p5.mouseY });

                    socket.emit("stroke-current", { id: self().id, stroke: this.state.currentStrokes[self().id]});
                } else {
                    // this.state.currentStroke.points[this.state.currentStroke.points.length-1].x = p5.mouseX;
                    // this.state.currentStroke.points[this.state.currentStroke.points.length-1].y = p5.mouseY;
                }
            } else {
                this.state.currentStrokes[self().id]?.points.push({ x: p5.mouseX, y: p5.mouseY });
                socket.emit("stroke-current", { id: self().id, stroke: this.state.currentStrokes[self().id]});
            }
        }
    }

    undo() {
        let strokeIndexToRemove = -1;
        for (let i = this.state.strokes.length - 1; i >= 0; i--) {
            if (this.state.strokes[i].id === this.self.id) {
                strokeIndexToRemove = i;
                break;
            }
        }
        if (strokeIndexToRemove === -1) return;

        // Update server with undo
        addAndRemoveCanvasStroke(this.canvasId, undefined, [strokeIndexToRemove]);

        this.redoStack.push(this.state.strokes[strokeIndexToRemove]); // Push last stroke on redoStack
        this.state.strokes.splice(strokeIndexToRemove, 1);
        this.setState({ ...this.state, strokes: this.state.strokes });
    }

    redo() {
        if (this.redoStack.length <= 0) return;
        const lastRedo = this.redoStack.pop()!;

        const newStrokes = [...this.state.strokes, lastRedo];
        this.setState({ ...this.state, strokes: newStrokes });
    }

    render() {
        if (this.fixedImgRef.current) {
            this.fixedImgRef.current.style.display = 'block';
        }
        return <>
            <div onMouseMove={this.handleMouseMove} className={styles['canvas-container']} ref={this.canvasContainerRef}></div>
            {/* <canvas ref={this.fixedImgRef} width={this.width} height={this.height} style={{display: 'block'}} /> */}
        </>
    }
}

export default DisplayCanvas