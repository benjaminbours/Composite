import React from "react";
import ReactDOM from "react-dom";
import App from "../src/App";

// beforeEach(() => {
//     console.log("hola ombre");
// });

describe("App", () => {
    it("should render", () => {
        const root = document.createElement("div");
        ReactDOM.render(
            <App />,
            root,
        );
    });
});
