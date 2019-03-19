## [0.8.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.1...v0.8.2) (2019-03-19)


### Bug Fixes

* upload screenshot to github cdn ([9be45d1](https://github.com/atom-ide-community/atom-ide-datatip/commit/9be45d1))

## [0.8.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.8.0...v0.8.1) (2019-03-18)


### Bug Fixes

* [#30](https://github.com/atom-ide-community/atom-ide-datatip/issues/30) ([94c5031](https://github.com/atom-ide-community/atom-ide-datatip/commit/94c5031))
* removed datatip padding ([da9553a](https://github.com/atom-ide-community/atom-ide-datatip/commit/da9553a)), closes [#28](https://github.com/atom-ide-community/atom-ide-datatip/issues/28)

# [0.8.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.5...v0.8.0) (2019-03-18)


### Features

* add request token to markdown service calls ([16876c0](https://github.com/atom-ide-community/atom-ide-datatip/commit/16876c0))

## [0.7.5](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.4...v0.7.5) (2019-03-18)


### Bug Fixes

* datatip leftovers, max-height for large documentation ([4fd3228](https://github.com/atom-ide-community/atom-ide-datatip/commit/4fd3228))

## [0.7.4](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.3...v0.7.4) (2019-03-17)


### Bug Fixes

* font-size and pre tag design ([4a2a5a5](https://github.com/atom-ide-community/atom-ide-datatip/commit/4a2a5a5))

## [0.7.3](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.2...v0.7.3) (2019-03-17)


### Bug Fixes

* dependency installation prompt ([85386ed](https://github.com/atom-ide-community/atom-ide-datatip/commit/85386ed))

## [0.7.2](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.1...v0.7.2) (2019-03-17)


### Bug Fixes

* null pointer during startup ([6b1e399](https://github.com/atom-ide-community/atom-ide-datatip/commit/6b1e399))

## [0.7.1](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.7.0...v0.7.1) (2019-03-17)


### Bug Fixes

* package-dependency installation ([9f06556](https://github.com/atom-ide-community/atom-ide-datatip/commit/9f06556))

# [0.7.0](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.9...v0.7.0) (2019-03-17)


### Features

* introduce markdown-rendering service ([b42076f](https://github.com/atom-ide-community/atom-ide-datatip/commit/b42076f))

## [0.6.9](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.8...v0.6.9) (2019-03-15)


### Bug Fixes

* do not show the datatip when the mouse is too far away from a token ([793321e](https://github.com/atom-ide-community/atom-ide-datatip/commit/793321e)), closes [/github.com/facebookarchive/nuclide/blob/master/modules/atom-ide-ui/pkg/atom-ide-datatip/lib/DatatipManager.js#L79L94](https://github.com//github.com/facebookarchive/nuclide/blob/master/modules/atom-ide-ui/pkg/atom-ide-datatip/lib/DatatipManager.js/issues/L79L94)

## [0.6.8](https://github.com/atom-ide-community/atom-ide-datatip/compare/v0.6.7...v0.6.8) (2019-03-12)


### Bug Fixes

* travic-ci build ([491c14e](https://github.com/atom-ide-community/atom-ide-datatip/commit/491c14e))
* updated package-lock.json for fixing travis build ([ee0ef35](https://github.com/atom-ide-community/atom-ide-datatip/commit/ee0ef35))

### 0.6.6
* move to atom-ide-community

### 0.6.5 - Bugfix Release
* proper handling of null & undefined from LSP

### 0.6.4 - Bugfix Release
* hide the data tip as soon as keyboard input is detected

### 0.6.3 - Bugfix Release
* introduce the same timing constraint for cursor move event to make rapid typing less cumbersome

### 0.6.2 - Bugfix Release
* optimize mouse move capturing by waiting for mouse move ended event before calling datatip provider

### 0.6.1 - Bugfix Release
* optimize range / point calculation for cursor / mouse movement
* make data tip stick on screen when mouse enters it

## 0.6.0 - Capture the Mouse Move Event
* add a new config option (default: false) to update the data tip as soon as you move your mouse around

### 0.5.1 - Bugfix Release
* proper rendering of a sequence of snippets and markdown texts
* fixing some UI glitches related to scrollbars

## 0.5.0 - Syntax colouring in Code Snippet view
* finally get the syntax colouring working thanks to the guys from Atom-TypeScript

## 0.4.0 - Support for config setting
* there is now a new config option to disable display of the data tooltip automatically as soon as you move your cursor around.
* if this setting is true, it will show the same behavior than before
* if this setting is false, it will only activate / show the data tooltip when triggered manually via the keyboard shortcut (default: `CTRL+ALT` on Windows/Linux, or `CMD+ALT` on Mac)

## 0.3.0 - Support for React components in DataTip
* merge pull request to support React components in DataTip API
* upgrade marked to 0.6.0

### 0.2.3 - 3rd Hotfix
* fix text editor scrolling when mouse-wheel in large markdown text

### 0.2.2 - 2nd Hotfix
* fix an issue preventing the overlay to show if the markedString is undefined

### 0.2.1 - 1st Hotfix
* fix an timing issue that still leads to left overs from previous overlays when navigating the code

## 0.2.0 - 1st Bugfix Release
* Adding Config settings for showing / dismissing overlay timer

## 0.1.0 - First Release
* Initial Release on Atom.io
* Properly rendering markdown in overlay
* UI bugfixes for overlay (shadow, sizing)
