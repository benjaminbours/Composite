# TODO

## About communication front - back

- Je n'ai pas encore verifie que l'on peut recover une session, etc => https://socket.io/docs/v4/connection-state-recovery
- Add arrow on the HUD to indicate position of your team mate when he is far

## Required

- Orchestrate efficiently the transition between the menu, the game, the state on the server, the connection, etc => tout en sommes
- support different type of keyboard layout (qwerty, azerty, blabla)

### Menu

- Ensure all click action on menu are on buttons element to maximize browser compatibility
- Fix responsive menu with last changes

### Game

- Indicate where you team mate is in a game, and add possibility to call your friend in a direction somehow
- Restore level loading
- Display a message if your team mate disconnect => manage the behavior if its happening during the game

## Nice to have

- Install react plugin eslint hook rules check
- Indicate total number of player online at the moment. Curve fever style
- On menu queue scene, provide a button to change side / level
- Add information in the menu about the server state
  - Estimated waiting time
- make floating animation for player
- Rethink the way the level are built, everything could be imported from Blender or other tool to generate level
- Check to optimize / improve the shadow player shader
- Lint front
- Game state can be optimized about door management

## To fix

- Manage disconnect event while in game
- Fix crash when you are in game, your team mate leave and you click to find another teammate, HomeInterface is null
- Fix the fact player can exit bounce element without pressing enter sometimes
- Improve the game state management with redis. So far, it's too hardcoded and doesn't scale as good as it could

## Potential game play suggestion

- L3Gl0N__:
  - black hole, potential impact on gravity
  - Dash for the light
  - shadow can avoid gravity for a while, or go through spaces the light can't, the main idea is about not having movement constraints for a duration
  - End level animation => make the player attracted by the center of the animation, kind of an ascension
- uchinara:
  - Player bounce against each other
  - onde / particles
- rumpleplays:
  - Open a dedicated discord, bitch

## Think about bounce mechanism

- si le player light peut rentrer dans le bounce light, quand pas de player inside, does it bounce?
- Est ce que on ne voudrait pas des elements qui ont un skin shadow + light (kind of) ou n'importe lequel des players peut rentrer a l'interieur ?
- Est ce que on ne voudrait pas simplement des bounces "classique" qui n'ont pas besoin de player ? Si uniquement des bounces avec player, ca limite un peu
- Est ce que les players se repoussent ? OUI

## Credit

- thank you for the mental support and follow up, they sent me so much strength:
  - L3Gl0N__
  - uchinara

- thank you for making me discover this lib => https://github.com/gkjohnson/three-mesh-bvh, was a game changer in terms of performance + youtube video about designing puzzle game
  - uchinara

## If I ever receive one penny for this game

- Support this lib => https://github.com/gkjohnson/three-mesh-bvh

## Twitch

Give it a try to nightbot, stop being a noob

## To finish

- The update bindings menu is working correctly in game, but has not been tested properly on the menu part.
