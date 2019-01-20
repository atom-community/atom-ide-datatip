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
