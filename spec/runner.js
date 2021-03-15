"use babel"
// eslint-disable-next-line import/named
import { createRunner } from "atom-jasmine3-test-runner"

// https://github.com/UziTech/atom-jasmine3-test-runner#api
export default createRunner({
  testPackages: ["atom-ide-markdown-service", "busy-signal"],
  timeReporter: true,
  specHelper: true,
})
