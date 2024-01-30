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
- Address lint warnings
- S4oul => https://roadmap.sh/cpp first, the connections and styles are interesting, then it can be nice to link roadmap points with github ticket. The goal is to reduce friction and ease a maximum the eventual collaboration experience.
- L3Gl0N__: Moi ce que je kifferai avoir à la place du synchronize .... Ce serais une grande vue comme ça et cela zoom sur le perso et seulement après tu peux jouer, le delai d'animation sert de synchro
- Use the already stored "entryNormal" inside the element to bounce to make coherent the entry and exit normal of the player.

## To fix

- Improve the game state management with redis. So far, it's too hardcoded and doesn't scale as good as it could
- I have seen a very big graphic bug on google chrome related to bounces shadow
- On learn to fly when high, we can see the end of the shader box, the end of the "world"
- The player in light composer change slightly the whole brightness of the screen when going in and out
- Bug with end game animation
- Bug with the wave when the menu is remounted after entering the game, the wave is not reacting with the mouse anymore.
- On loading of any page of the website, there is blank screen with loading written for a moment before disappearing. Fix it.

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
  - uchinara => The guy disapeared, hope he is well :(
  - S4oul
  - Smoke
  - strailder => discord but he disapeard so far

- thank you for making me discover this lib => https://github.com/gkjohnson/three-mesh-bvh, was a game changer in terms of performance + youtube video about designing puzzle game
  - uchinara
- This shader toy shader => https://www.shadertoy.com/view/Xsl3zX recomended by Legion
- Andrew Berg for this => https://medium.com/@andrew_b_berg/volumetric-light-scattering-in-three-js-6e1850680a41


## Stupid things to do

- Record welcome to millenium from => https://open.spotify.com/track/2GHnPQ8mAukedPzVZWRyTj?si=059aff8634a84bee and use it as a jingle when people subscribe

## If I ever receive one penny for this game

- Support this lib => https://github.com/gkjohnson/three-mesh-bvh
- Donate to shadertoy

## Twitch

- nvidia broadcast

## What to remember from test with viewers

- Sometimes, I can go through element of the same color than my entity, instead of entering into it, it's not suppose to happen

- Investigate why A stay displayed when Q is binded
- Transition menu from player quit the room to home is not smooth
- Updating key bindings have some bugs, key disappearing for example
- Could be a idea to optimize and improve the UI to have a timing indicator about the next fetch of the queue state. That way, the user can trigger by himself faster if he wants, otherwise, he knows when the update will happen, and this allow me to increase the polling rate

- At the beginning of each level, indicate the basic keys could be helpful
- very light wave, pulsing at a frequency from where an element is being interacted with, to indicate other player the focus point
- Is it complicated to add controller support?
- Double jump
- twitch game support?
- Avoir des petites plateforme qui bouge, ou des éléments de décor qui change en fonction de si light ou shadow est dans la zone ou sur un interrupteur, dinguerie en devenir

## First streamer ever who played my game

- s17n
  - Because Legion sponsored me on his stream after a raid

## Bug report on discord

Still need to address number 2 and 5

## To be decided with the community

- Double jump feature when jumping against walls? Would change a lot the game but could be funny no?

## Police to test for home scene

- https://www.1001fonts.com/nk57-monospace-font.html
- https://www.ffonts.net/CPMono_v07Bold.font?text=COMPOSITE#

## TODAY

- Add recurrent message such as kofibot, to print available commands for users in the chat. Or put it in the title of the stream.
- Lobby not always detecting choice of team mate on loading
- Enable github sponsor?
