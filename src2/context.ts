import React from "react";

export const states = {
    home: {
        currentScene: "home",
        isMouseHoverPlay: false,
    },
};

// default value
export const Context = React.createContext({
    ...states.home,
    handleMouseEnterPlay: () => {
        //
    },
    handleMouseLeavePlay: () => {
        //
    },
    handleClickOnPlay: () => {
        //
    },
});
