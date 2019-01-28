/**
 * CanvasRenderingContext2D.renderText extension
 */
if (CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.renderText) {
    // @param  letterSpacing  {float}  CSS letter-spacing property
    CanvasRenderingContext2D.prototype.renderText = function(text: string, x: number, y: number, letterSpacing: number) {
        if (!text || typeof text !== "string" || text.length === 0) {
            return;
        }

        if (typeof letterSpacing === "undefined") {
            letterSpacing = 0;
        }

        // letterSpacing of 0 means normal letter-spacing

        let characters = text.split("");
        // let characters = String.prototype.split.call(text, "");
        let index = 0;
        let current;
        let currentPosition = x;
        let align = 1;

        if (this.textAlign === "right") {
            characters = characters.reverse();
            align = -1;
        } else if (this.textAlign === "center") {
            let totalWidth = 0;
            for (const item of characters) {
                totalWidth += (this.measureText(item).width + letterSpacing);
            }
            currentPosition = x - (totalWidth / 2);
        }

        while (index < text.length) {
            current = characters[index++];
            this.fillText(current, currentPosition, y);
            currentPosition += (align * (this.measureText(current).width + letterSpacing));
        }
    };
}
