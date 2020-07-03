## [0.11.4](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.11.3...v0.11.4) (2020-04-13)

### Bug Fixes

- activation hook to improve the loading time by deferring it ([3262ab3](https://github.com/atom-ide-community/atom-ide-datatip/commit/3262ab3))

## [0.11.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.11.2...v0.11.3) (2020-04-11)

### Bug Fixes

- clarify config descriptions ([cc87ca8](https://github.com/atom-ide-community/atom-ide-datatip/commit/cc87ca8))
- config for waiting time (decreased the default) ([07a8164](https://github.com/atom-ide-community/atom-ide-datatip/commit/07a8164))

## [0.11.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.11.1...v0.11.2) (2020-02-02)

### Bug Fixes

- toggle command not closing tooltip ([9f60168](https://github.com/atom-ide-community/atom-ide-datatip/commit/9f60168)), closes [#54](https://github.com/atom-ide-community/atom-ide-datatip/issues/54)

## [0.11.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.11.0...v0.11.1) (2019-12-07)

### Bug Fixes

- use UI-font for markdown body strings ([db0d07b](https://github.com/atom-ide-community/atom-ide-datatip/commit/db0d07b))

# [0.11.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.6...v0.11.0) (2019-06-24)

### Bug Fixes

- make iteration over datatip providers obvious ([3b8f0fa](https://github.com/atom-ide-community/atom-ide-datatip/commit/3b8f0fa))

### Features

- iterate over datatip providers and show the datatip of the first ([29ee00b](https://github.com/atom-ide-community/atom-ide-datatip/commit/29ee00b))
- upgrade additional build packages ([9818b39](https://github.com/atom-ide-community/atom-ide-datatip/commit/9818b39))

## [0.10.6](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.5...v0.10.6) (2019-06-21)

### Bug Fixes

- [#43](https://github.com/atom-ide-community/atom-ide-datatip/issues/43) use grammar scope name instead of grammar name ([6b2b43c](https://github.com/atom-ide-community/atom-ide-datatip/commit/6b2b43c))

## [0.10.5](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.4...v0.10.5) (2019-06-21)

### Bug Fixes

- upgrade packages ([55209af](https://github.com/atom-ide-community/atom-ide-datatip/commit/55209af))

## [0.10.4](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.3...v0.10.4) (2019-04-25)

### Bug Fixes

- remove language identifier preambles from code snippets ([2c02f9b](https://github.com/atom-ide-community/atom-ide-datatip/commit/2c02f9b))

## [0.10.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.2...v0.10.3) (2019-04-25)

### Bug Fixes

- multiple items of same type in datatip; preamble in snippets ([88173a2](https://github.com/atom-ide-community/atom-ide-datatip/commit/88173a2))

## [0.10.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.1...v0.10.2) (2019-04-18)

### Bug Fixes

- markdown text positioning ([770399a](https://github.com/atom-ide-community/atom-ide-datatip/commit/770399a))

## [0.10.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.10.0...v0.10.1) (2019-04-18)

### Bug Fixes

- markdown text rendering ([a095867](https://github.com/atom-ide-community/atom-ide-datatip/commit/a095867))

# [0.10.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.5...v0.10.0) (2019-04-18)

### Bug Fixes

- encapsulation of datatip service interface ([43b505e](https://github.com/atom-ide-community/atom-ide-datatip/commit/43b505e))
- remove console logs ([505dbce](https://github.com/atom-ide-community/atom-ide-datatip/commit/505dbce))
- remove obsolete typings reference ([c4ad0d4](https://github.com/atom-ide-community/atom-ide-datatip/commit/c4ad0d4))
- update markdown service reference to 1.0.0 ([d2b299f](https://github.com/atom-ide-community/atom-ide-datatip/commit/d2b299f))

### Features

- additional code documentation ([f0328f2](https://github.com/atom-ide-community/atom-ide-datatip/commit/f0328f2))
- code docs and adding typings ([45b1ec5](https://github.com/atom-ide-community/atom-ide-datatip/commit/45b1ec5))
- prepare central data tip manager ([837a39b](https://github.com/atom-ide-community/atom-ide-datatip/commit/837a39b))
- separate snippet from documentation view again ([1c3cd9b](https://github.com/atom-ide-community/atom-ide-datatip/commit/1c3cd9b))
- use new renderer with default grammar input ([17b9f3e](https://github.com/atom-ide-community/atom-ide-datatip/commit/17b9f3e))

## [0.9.5](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.4...v0.9.5) (2019-04-08)

### Bug Fixes

- rendering of markdown text with additional break in the description ([172719d](https://github.com/atom-ide-community/atom-ide-datatip/commit/172719d))

## [0.9.4](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.3...v0.9.4) (2019-03-31)

### Bug Fixes

- hide datatip view if cursor moved to position without datatip ([bf3e635](https://github.com/atom-ide-community/atom-ide-datatip/commit/bf3e635))

## [0.9.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.2...v0.9.3) (2019-03-31)

### Bug Fixes

- remove blinking of tooltip window when mouse hover it ([f940370](https://github.com/atom-ide-community/atom-ide-datatip/commit/f940370))

### Reverts

- unrelated and wrong changes ([0da78d7](https://github.com/atom-ide-community/atom-ide-datatip/commit/0da78d7))

## [0.9.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.1...v0.9.2) (2019-03-21)

### Bug Fixes

- it doesn't like dynamic heights for long markdown descriptions :( ([456c02f](https://github.com/atom-ide-community/atom-ide-datatip/commit/456c02f))

## [0.9.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.9.0...v0.9.1) (2019-03-21)

### Bug Fixes

- datatip overlay size ([be70a7f](https://github.com/atom-ide-community/atom-ide-datatip/commit/be70a7f))

# [0.9.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.3...v0.9.0) (2019-03-21)

### Features

- don't show overlay if another is already visible at the same range ([58fc173](https://github.com/atom-ide-community/atom-ide-datatip/commit/58fc173))

## [0.8.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.2...v0.8.3) (2019-03-19)

### Bug Fixes

- improve handling of unmounting data tips on screen ([c4f4441](https://github.com/atom-ide-community/atom-ide-datatip/commit/c4f4441))

## [0.8.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.1...v0.8.2) (2019-03-19)

### Bug Fixes

- upload screenshot to github cdn ([9be45d1](https://github.com/atom-ide-community/atom-ide-datatip/commit/9be45d1))

## [0.8.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.0...v0.8.1) (2019-03-18)

### Bug Fixes

- [#30](https://github.com/atom-ide-community/atom-ide-datatip/issues/30) ([94c5031](https://github.com/atom-ide-community/atom-ide-datatip/commit/94c5031))
- removed datatip padding ([da9553a](https://github.com/atom-ide-community/atom-ide-datatip/commit/da9553a)), closes [#28](https://github.com/atom-ide-community/atom-ide-datatip/issues/28)

# [0.8.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.5...v0.8.0) (2019-03-18)

### Features

- add request token to markdown service calls ([16876c0](https://github.com/atom-ide-community/atom-ide-datatip/commit/16876c0))

## [0.7.5](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.4...v0.7.5) (2019-03-18)

### Bug Fixes

- datatip leftovers, max-height for large documentation ([4fd3228](https://github.com/atom-ide-community/atom-ide-datatip/commit/4fd3228))

## [0.7.4](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.3...v0.7.4) (2019-03-17)

### Bug Fixes

- font-size and pre tag design ([4a2a5a5](https://github.com/atom-ide-community/atom-ide-datatip/commit/4a2a5a5))

## [0.7.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.2...v0.7.3) (2019-03-17)

### Bug Fixes

- dependency installation prompt ([85386ed](https://github.com/atom-ide-community/atom-ide-datatip/commit/85386ed))

## [0.7.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.1...v0.7.2) (2019-03-17)

### Bug Fixes

- null pointer during startup ([6b1e399](https://github.com/atom-ide-community/atom-ide-datatip/commit/6b1e399))

## [0.7.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.0...v0.7.1) (2019-03-17)

### Bug Fixes

- package-dependency installation ([9f06556](https://github.com/atom-ide-community/atom-ide-datatip/commit/9f06556))

# [0.7.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.9...v0.7.0) (2019-03-17)

### Features

- introduce markdown-rendering service ([b42076f](https://github.com/atom-ide-community/atom-ide-datatip/commit/b42076f))

## [0.6.9](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.8...v0.6.9) (2019-03-15)

### Bug Fixes

- do not show the datatip when the mouse is too far away from a token ([793321e](https://github.com/atom-ide-community/atom-ide-datatip/commit/793321e)), closes [/github.com/facebookarchive/nuclide/blob/master/modules/atom-ide-ui/pkg/atom-ide-datatip/lib/DatatipManager.js#L79L94](https://github.com//github.com/facebookarchive/nuclide/blob/master/modules/atom-ide-ui/pkg/atom-ide-datatip/lib/DatatipManager.js/issues/L79L94)

## [0.6.8](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.7...v0.6.8) (2019-03-12)

### Bug Fixes

- travic-ci build ([491c14e](https://github.com/atom-ide-community/atom-ide-datatip/commit/491c14e))
- updated package-lock.json for fixing travis build ([ee0ef35](https://github.com/atom-ide-community/atom-ide-datatip/commit/ee0ef35))

### 0.6.6

- move to atom-ide-community

### 0.6.5 - Bugfix Release

- proper handling of null & undefined from LSP

### 0.6.4 - Bugfix Release

- hide the data tip as soon as keyboard input is detected

### 0.6.3 - Bugfix Release

- introduce the same timing constraint for cursor move event to make rapid typing less cumbersome

### 0.6.2 - Bugfix Release

- optimize mouse move capturing by waiting for mouse move ended event before calling datatip provider

### 0.6.1 - Bugfix Release

- optimize range / point calculation for cursor / mouse movement
- make data tip stick on screen when mouse enters it

## 0.6.0 - Capture the Mouse Move Event

- add a new config option (default: false) to update the data tip as soon as you move your mouse around

### 0.5.1 - Bugfix Release

- proper rendering of a sequence of snippets and markdown texts
- fixing some UI glitches related to scrollbars

## 0.5.0 - Syntax colouring in Code Snippet view

- finally get the syntax colouring working thanks to the guys from Atom-TypeScript

## 0.4.0 - Support for config setting

- there is now a new config option to disable display of the data tooltip automatically as soon as you move your cursor around.
- if this setting is true, it will show the same behavior than before
- if this setting is false, it will only activate / show the data tooltip when triggered manually via the keyboard shortcut (default: `CTRL+ALT` on Windows/Linux, or `CMD+ALT` on Mac)

## 0.3.0 - Support for React components in DataTip

- merge pull request to support React components in DataTip API
- upgrade marked to 0.6.0

### 0.2.3 - 3rd Hotfix

- fix text editor scrolling when mouse-wheel in large markdown text

### 0.2.2 - 2nd Hotfix

- fix an issue preventing the overlay to show if the markedString is undefined

### 0.2.1 - 1st Hotfix

- fix an timing issue that still leads to left overs from previous overlays when navigating the code

## 0.2.0 - 1st Bugfix Release

- Adding Config settings for showing / dismissing overlay timer

## 0.1.0 - First Release

- Initial Release on Atom.io
- Properly rendering markdown in overlay
- UI bugfixes for overlay (shadow, sizing)
