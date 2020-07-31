"use babel"
import { createRunner } from "atom-jasmine3-test-runner"

// https://github.com/UziTech/atom-jasmine3-test-runner#api
export default createRunner({
  testPackages: ["atom-ide-markdown-service", "busy-signal"],
  timeReporter: true,
  specHelper: true,
  attachToDOM: true,
  // Extra Packages
  customMatchers: true,
  jasmineFocused: false,
  jasmineJson: false,
  jasminePass: false,
  jasmineShouldFail: false,
  jasmineTagged: false,
  mockClock: true,
  mockLocalStorage: false,
  profile: true,
  unspy: false,
})
