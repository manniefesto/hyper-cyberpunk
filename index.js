exports.decorateTerm = (Term, { React }) => {
    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.term = null;
            this.onDecorated = this.onDecorated.bind(this);
            this.onCursorMove = this.onCursorMove.bind(this);
            this.glitching = false;
            this.glitchingTimeout = null;
            this._div = null;
            this._canvas = null;
            this._textCanvas = null;
            this._glitchText = this._glitchText.bind(this);
            this._resizeCanvas = this._resizeCanvas.bind(this);

        }


        componentWillUnmount() {
            document.body.removeChild(this._canvas);
        }

        _initCanvas() {
            this._canvas = document.createElement('canvas');
            this._canvas.style.position = 'absolute';
            this._canvas.style.top = '0';
            this._canvas.style.pointerEvents = 'none';
            this._canvasContext = this._canvas.getContext('2d');
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
            document.body.appendChild(this._canvas);
            window.requestAnimationFrame(this._glitchText);
            window.addEventListener('resize', this._resizeCanvas);
        }

        _resizeCanvas() {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
        }

        _glitchText() {

            var randInt = function(a, b) {
				return ~~(Math.random() * (b - a) + a);
            };
            
            //TODO: generalize margin top
            const destCtx = this._canvas.getContext('2d');
            destCtx.drawImage(this._textCanvas, this._div.offsetLeft, this._div.offsetTop + 34);
            destCtx.filter = `hue-rotate(${Math.random() * 360}deg)`;
            var x = Math.random() * window.innerWidth;
            var y = Math.random() * window.innerHeight;
            var spliceWidth = window.innerWidth - x;
            var spliceHeight = randInt(5, window.innerHeight / 3);
            destCtx.drawImage(this._canvas, 0, y, spliceWidth, spliceHeight, x, y, spliceWidth, spliceHeight);
            destCtx.drawImage(this._canvas, spliceWidth, y, x, spliceHeight, 0, y, x, spliceHeight);
        }

        

        onCursorMove(cursorFrame) {
            if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);
            window.requestAnimationFrame(this._glitchText);

            if (this.glitchingTimeout !== null) {
                clearTimeout(this.glitchingTimeout);
            }

            this.glitchingTimeout = setTimeout(() => {
                const destCtx = this._canvas.getContext('2d');
                destCtx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            }, 300);

        }

        onDecorated(term) {
            this.term = term;
            this._div = term.termRef;
            this._textCanvas = this._div.querySelector(".xterm-text-layer");
            // Don't forget to propagate it to HOC chain
            if (this.props.onDecorated) this.props.onDecorated(term);
            this._initCanvas();
        }

        render() {
            return React.createElement(
                Term,
                Object.assign({}, this.props, {
                    onDecorated: this.onDecorated,
                    onCursorMove: this.onCursorMove
                })
            );
        }
    };
};