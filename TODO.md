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
- Split the enormous game app file into pieces
  - client graphic + physic updates
  - Rendering
  - Post processing
  - State reconciliation / management

## To fix

- Manage disconnect event while in game
- Fix crash when you are in game, your team mate leave and you click to find another teammate, HomeInterface is null
- Improve the game state management with redis. So far, it's too hardcoded and doesn't scale as good as it could
- I have seen a very big graphic bug on google chrome related to bounces shadow
- Bug with the queue

## Potential game play suggestion

- L3Gl0N__:
  - black hole, potential impact on gravity
  - Dash for the light
  - shadow can avoid gravity for a while, or go through spaces the light can't, the main idea is about not having movement constraints for a duration
  - End level animation => make the player attracted by the center of the animation, kind of an ascension
- uchinara:
  - Player bounce against each other
  - onde / particles

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

## What to remember from test with viewers

- Sometimes, I can go through element of the same color than my entity, instead of entering into it, it's not suppose to happen

- Investigate why A stay displayed when Q is binded
- Transition menu from player quit the room to home is not smooth
- Updating key bindings have some bugs, key disappearing for example
- Could be a idea to optimize and improve the UI to have a timing indicator about the next fetch of the queue state. That way, the user can trigger by himself faster if he wants, otherwise, he knows when the update will happen, and this allow me to increase the polling rate

- At the beginning of each level, indicate the basic keys could be helpful
- indicator of direction when going out of a platform => chevron rouge qui pointe
- very light wave, pulsing at a frequency from where an element is being interacted with, to indicate other player the focus point
- investigate [mix blend mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) for the menu animation, see website => https://buttermax.net/
- Is it complicated to add controller support?
- Double jump
- twitch game support?

## First streamer ever who played my game

- s17n
  - Because Legion sponsored me on his stream after a raid
