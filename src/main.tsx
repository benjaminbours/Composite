import "./styles/main.scss";
import "./Menu/crossBrowser";
import React from "react";
import ReactDOM from "react-dom";
import MainApp from "./MainApp";

ReactDOM.render(
    <MainApp />,
    document.querySelector("#root"),
);
