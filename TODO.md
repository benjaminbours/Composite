# TODO

## About communication front - back

- Je n'ai pas encore verifie que l'on peut recover une session, etc => https://socket.io/docs/v4/connection-state-recovery
- Add arrow on the HUD to indicate position of your team mate when he is far

## Required

- Orchestrate efficiently the transition between the menu, the game, the state on the server, the connection, etc => tout en sommes

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

- manage disconnect event while in game
- Fix issue when you finished first level and then you go with your team mate in the second one
- Collision system issue, especially with bounce element, it's easy to enter inside and get stuck
- Move from raycaster to overlap for collision detection
- Fix crash when you are in game, your team mate leave and you click to find another teammate, HomeInterface is null

## Potential game play suggestion

- L3Gl0N__:
  - black hole, potential impact on gravity
  - Dash for the light
  - shadow can avoid gravity for a while, or go through spaces the light can't, the main idea is about not having movement constraints for a duration
- uchinara:
  - Player bounce against each other
  - onde / particles

## Think about bounce mechanism

- si le player light peut rentrer dans le bounce light, quand pas de player inside, does it bounce?
- Est ce que on ne voudrait pas des elements qui ont un skin shadow + light (kind of) ou n'importe lequel des players peut rentrer a l'interieur ?
- Est ce que on ne voudrait pas simplement des bounces "classique" qui n'ont pas besoin de player ? Si uniquement des bounces avec player, ca limite un peu
- Est ce que les players se repoussent ? OUI
