# TODO

## About communication front - back

- Je n'ai pas encore verifie que l'on peut recover une session, etc => https://socket.io/docs/v4/connection-state-recovery
- Add arrow on the HUD to indicate position of your team mate when he is far

## Required

- Restore level loading
- Restore occlusion with the light if some element are in front of the camera
- On menu queue scene, provide a button to change side / level
- On menu queue scene, when player press back, the server should remove him from the queue
- Orchestrate efficiently the transition between the menu, the game, the state on the server, the connection, etc
- Fix responsive menu this last changes
- Ensure all click action on menu are on buttons element to maximize browser compatibility

## Nice to have

- Add information in the menu about the server state
  - Estimated waiting time
- make floating animation for player
- Rethink the way the level are built, everything could be imported from Blender or other tool to generate level
- Check to optimize / improve the shadow player shader
- Lint front
