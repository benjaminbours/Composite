# composite-back

## 1.0.0-next.24

### Patch Changes

- Bump to deploy
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.27

## 1.0.0-next.23

### Patch Changes

- Bump version to deploy packages
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.24

## 1.0.0-next.22

### Patch Changes

- Regenerate prisma client

## 1.0.0-next.21

### Patch Changes

- Improve level thumbnail management
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.20

## 1.0.0-next.20

### Patch Changes

- 9c60841: Add various code security and quality improvement
- Updated dependencies [9c60841]
  - @benjaminbours/composite-core@1.0.0-next.19

## 1.0.0-next.19

### Patch Changes

- 296385f: Optimize docker image. Add google analytics event.

## 1.0.0-next.18

### Patch Changes

- Display leaderboard rank on end level view. Sort level by difficulty on lobby.
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.18

## 1.0.0-next.17

### Patch Changes

- Add game duration tracking + community views with stats, ranking, ratings, etc
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.17

## 1.0.0-next.16

### Patch Changes

- Fix graphic bugs
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.16

## 1.0.0-next.15

### Patch Changes

- Refactor client lobby
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.15

## 1.0.0-next.14

### Patch Changes

- Hot fixes from last released
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.14

## 1.0.0-next.13

### Patch Changes

- Disable jump if player is touching a bounce element no interactive of his side
- Improve / optimize rendering of light bounces
- Editor: add helper about mouse right click displacement
- Add help text with discord button on lobby scene
- Improve synchronization overlay, display valuable information while the user is waiting
- Fix various level editor bugs
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.13

## 1.0.0-next.12

### Patch Changes

- Various bug fix and improvement
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.12

## 1.0.0-next.11

### Patch Changes

- Various bug fixes and UX improvements
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.11

## 1.0.0-next.10

### Patch Changes

- Various improvements
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.10

## 1.0.0-next.9

### Patch Changes

- Add minimap
- Add key to reset player position
- Updated dependencies
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.9

## 1.0.0-next.8

### Patch Changes

- Refactor implementatin of client prediction / reconciliation
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.8

## 1.0.0-next.7

### Patch Changes

- More performance optimization
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.7

## 1.0.0-next.6

### Patch Changes

- Performance improvements
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.6

## 1.0.0-next.5

### Patch Changes

- Some performance optimization. Fix issue with camera focus and door opener.
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.5

## 1.0.0-next.4

### Patch Changes

- Add interact touch to focus camera on door opener. Add start position as editable in level editor.
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.4

## 1.0.0-next.3

### Patch Changes

- Fix and improve various things
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.3

## 1.0.0-next.2

### Patch Changes

- Major refactor of level editor app. UI improvement, bux fixes, overal improvement of the stability
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.2

## 1.0.0-next.1

### Patch Changes

- Fix various deployment bug. Fix crash when level table was empty. Display only published level on lobby. Fix issue with account creation and recaptcha.
- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.1

## 1.0.0-next.0

### Major Changes

- First major version

### Patch Changes

- Updated dependencies
  - @benjaminbours/composite-core@1.0.0-next.0

## 0.4.0

### Minor Changes

- b8d9a78: Add team lobby scene, connect it to invite a friend feature and to end level scene
- 4e0c720: Fix various bugs detected on the last dev deployment

### Patch Changes

- Updated dependencies [b8d9a78]
  - @benjaminbours/composite-core@0.3.0

## 0.4.0-next.1

### Minor Changes

- Fix various bugs detected on the last dev deployment

## 0.4.0-next.0

### Minor Changes

- 0fee674: Add team lobby scene, connect it to invite a friend feature and to end level scene

### Patch Changes

- Updated dependencies [0fee674]
  - @benjaminbours/composite-core@0.3.0-next.0

## 0.3.3

### Patch Changes

- 513dacd: Add client settings depending of the rtt. Add input buffering and adaptative sent rate. Improve client prediction and reconciliation.
- Updated dependencies [513dacd]
  - @benjaminbours/composite-core@0.2.6

## 0.3.2

### Patch Changes

- 3604076: Decrease network tick rate
- Updated dependencies [3604076]
- Updated dependencies [3da0b17]
  - @benjaminbours/composite-core@0.2.4

## 0.3.2-next.0

### Patch Changes

- 3604076: Decrease network tick rate
- Updated dependencies [3604076]
  - @benjaminbours/composite-core@0.2.4-next.0

## 0.3.1

### Patch Changes

- 7b25f0a: Improve latency management

## 0.3.0

### Minor Changes

- 198d227: Make the server send the last input knows for each client, so clients can improve predictions

### Patch Changes

- 198d227: Refactor socket gateway
- Updated dependencies [dfae287]
- Updated dependencies [dfae287]
- Updated dependencies [198d227]
  - @benjaminbours/composite-core@0.2.3

## 0.2.0

### Minor Changes

- Add second game mechanic and second level

### Patch Changes

- Updated dependencies
  - @benjaminbours/composite-core@0.2.0

## 0.1.1

### Patch Changes

- Fix light occlusion with environment
  - Create proper end level scene for menu
  - Make menu responsive
  - Make game responsive, add mobile HUD
- Updated dependencies
  - @benjaminbours/composite-core@0.1.1

## 0.1.0

### Minor Changes

- 3839a7d: First staging release

### Patch Changes

- f393a9f: Fix issue with positions
- d5237df: Fix issue on prod
- Release 0.1.0
- Updated dependencies [f393a9f]
- Updated dependencies [d5237df]
- Updated dependencies
- Updated dependencies [09b4b65]
  - @benjaminbours/composite-core@0.1.0

## 0.1.0-next.3

### Patch Changes

- Fix issue on prod
- Updated dependencies
  - @benjaminbours/composite-core@0.1.0-next.3

## 0.1.0-next.2

### Patch Changes

- Fix issue with positions
- Updated dependencies
  - @benjaminbours/composite-core@0.1.0-next.2

## 0.1.0-next.1

### Minor Changes

- Pre release 0.1.0

### Patch Changes

- Updated dependencies
  - @benjaminbours/composite-core@0.1.0-next.1

## 0.1.0-next.0

### Minor Changes

- First staging release

### Patch Changes

- Updated dependencies
  - composite-core@0.1.0-next.0
