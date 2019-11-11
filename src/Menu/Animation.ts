import { TimelineLite, TweenLite, GSAPStatic } from "gsap";
import React, { RefObject } from "react";
import Canvases from "./comps/Canvases";
import { bothComponents } from "./comps/Canvases/bothComponents";
import {
  Light,
  MainTitle,
  Shadow,
  SubtitleHome,
  TextDrawer,
} from "./comps/Canvases/comps";
import Curve, { defaultWaveOptions } from "./comps/Canvases/comps/Curve";
import CanvasBlack from "./comps/Canvases/layers/CanvasBlack";
import CanvasWhite from "./comps/Canvases/layers/CanvasWhite";
import {
  homeOut,
  curveToStep,
  lightToStep,
  shadowToStep,
  levelOut,
  levelIn,
  factionIn,
  factionOut,
  queueIn,
  queueOut,
  homeIn,
} from "./tweens";

interface IAnimationComps {
  homeInterface: RefObject<HTMLDivElement>;
  levelInterface: RefObject<HTMLDivElement>;
  factionInterface: RefObject<HTMLDivElement>;
  queueInterface: RefObject<HTMLDivElement>;
}

interface IAnimationCanvasComps {
  canvas: HTMLCanvasElement;
  curve: Curve;
  shadow: Shadow;
  light: Light;
  mainTitle: MainTitle;
  subtitleHome: SubtitleHome;
  titleFaction: TextDrawer;
}
export default class Animation {
  public static mouseEnterButtonPlay: GSAPStatic.Tween;
  public static mouseLeaveButtonPlay: GSAPStatic.Tween;

  public static homeToLevel: GSAPStatic.Timeline;
  public static levelToHome: GSAPStatic.Timeline;
  public static levelToFaction: GSAPStatic.Timeline;
  public static factionToLevel: GSAPStatic.Timeline;
  public static factionToQueue: GSAPStatic.Timeline;
  public static factionToQueueShadow: GSAPStatic.Timeline;
  public static factionToQueueLight: GSAPStatic.Timeline;
  public static queueToFaction: GSAPStatic.Timeline;

  public static components: IAnimationComps = {
    homeInterface: React.createRef(),
    levelInterface: React.createRef(),
    factionInterface: React.createRef(),
    queueInterface: React.createRef(),
  };

  public static canvasComponents: IAnimationCanvasComps;

  public static initComponents() {
    this.canvasComponents = {
      curve: (Canvases.layers.black as CanvasBlack).curve,
      light: (Canvases.layers.black as CanvasBlack).light,
      shadow: (Canvases.layers.white as CanvasWhite).shadow,
      canvas: (Canvases.layers.white as CanvasWhite).ctx.canvas,
      mainTitle: bothComponents.home.mainTitle,
      subtitleHome: bothComponents.home.title,
      titleFaction: bothComponents.faction.title,
    };
  }

  public static initHomeToLevel(onComplete: () => void) {
    const { curve, light } = this.canvasComponents;

    // console.log(lightToStep("level"), "here dude");
    // console.log(shadowToStep("level"), "here dude");
    this.homeToLevel = new TimelineLite({
      paused: true,
      onComplete: () => {
        curve.mouseIsHoverButton = false;
        light.isPulsingFast = false;
        this.mouseLeaveButtonPlay.play();
        onComplete();
      },
    })
      .add(curveToStep("level"))
      .add([lightToStep("level"), shadowToStep("level"), homeOut()], "-=0.5")
      .add(levelIn());
  }

  public static initLevelToHome(onComplete: () => void) {
    this.levelToHome = new TimelineLite({
      paused: true,
      onComplete: () => {
        onComplete();
      },
    })
      .add(curveToStep("home"))
      .add([lightToStep("home"), shadowToStep("home"), levelOut()], "-=0.5")
      .add(homeIn());
  }

  public static initLevelToFaction(onComplete: () => void) {
    this.levelToFaction = new TimelineLite({
      paused: true,
      onComplete: () => {
        onComplete();
      },
    })
      .add(curveToStep("faction"))
      .add(
        [lightToStep("faction"), shadowToStep("faction"), levelOut()],
        "-=0.5"
      )
      .add(factionIn());
  }

  public static initFactionToLevel(onComplete: () => void) {
    this.factionToLevel = new TimelineLite({
      paused: true,
      onComplete: () => {
        onComplete();
      },
    })
      .add(curveToStep("level"))
      .add(
        [lightToStep("level"), shadowToStep("level"), factionOut()],
        "-=0.5"
      )
      .add(levelIn());
  }

  public static initFactionToQueue(onComplete: () => void) {
    this.factionToQueue = new TimelineLite({
      paused: true,
      onComplete: () => {
        onComplete();
      },
    })
      .add(curveToStep("queue"))
      .add(
        [lightToStep("queue"), shadowToStep("queue"), factionOut()],
        "-=0.5"
      )
      .add(queueIn());
  }

  public static initQueueToFaction(onComplete: () => void) {
    this.queueToFaction = new TimelineLite({
      paused: true,
      onComplete: () => {
        onComplete();
      },
    })
      .add(curveToStep("faction"))
      .add(
        [lightToStep("faction"), shadowToStep("faction"), queueOut()],
        "-=0.5"
      )
      .add(factionIn());
  }

  public static initMouseEnterButtonPlay() {
    const { shadow } = this.canvasComponents;

    this.mouseEnterButtonPlay = TweenLite.to(shadow, 1, {
      paused: true,
      rotationSpeed: 0.02,
      ease: "power3.easeOut",
      // overwrite: "all",
    });
  }

  public static initMouseLeaveButtonPlay() {
    const { shadow } = this.canvasComponents;

    this.mouseLeaveButtonPlay = TweenLite.to(shadow, 1, {
      paused: true,
      rotationSpeed: 0.005,
      ease: "power3.easeOut",
      // overwrite: "all",
    });
  }

  public static playHomeToLevel() {
    this.setWaveInMoveMode();
    this.homeToLevel.play(0);
  }

  public static playLevelToHome() {
    this.setWaveInMoveMode();
    this.levelToHome.play(0);
  }

  public static playLevelToFaction() {
    this.setWaveInMoveMode();
    this.levelToFaction.play(0);
  }

  public static playFactionToLevel() {
    this.setWaveInMoveMode();
    this.factionToLevel.play(0);
  }

  public static playFactionToQueue() {
    this.setWaveInMoveMode();
    this.factionToQueue.play(0);
  }

  public static playQueueToFaction() {
    this.setWaveInMoveMode();
    this.queueToFaction.play(0);
  }

  public static playMouseLeaveButtonPlay() {
    const { curve, light } = this.canvasComponents;

    curve.mouseIsHoverButton = false;
    light.isPulsingFast = false;
    this.setWaveInDefaultMode();
    this.mouseLeaveButtonPlay.play();
  }

  public static playMouseEnterButtonPlay() {
    const { curve, light } = this.canvasComponents;

    curve.mouseIsHoverButton = true;
    Curve.setWaveOptions({
      randomRange: 300,
      amplitudeRange: 50,
      speed: 0.1,
    });
    light.isPulsingFast = true;
    // TweenLite.set(waveOptions, {
    //   randomRange: 300,
    //   amplitudeRange: 50,
    //   speed: 0.1,
    // });
    this.mouseEnterButtonPlay.play();
  }

  public static setWaveInMoveMode() {
    // const { curve } = this.canvasComponents;
    // TweenLite.set(waveOptions, {
    //   viscosity: 40,
    //   damping: 0.2,
    //   overwrite: "all",
    // });
    Curve.setWaveOptions({
      viscosity: 40,
      damping: 0.2,
    });
  }

  public static setWaveInDefaultMode() {
    // const { curve } = this.canvasComponents;
    // TweenLite.set(waveOptions, {
    //   ...defaultWaveOptions,
    // });
    Curve.setWaveOptions({
      ...defaultWaveOptions,
    });
  }
}
