import { describe, expect, it } from "vitest";

import { CONTENT } from "../constants";
import { createTitle } from "./createTitle";

describe("createTitle", () => {
  it("should return the app name when no pageName is provided", () => {
    expect(createTitle()).toEqual(CONTENT.appName);
  });
  it(`should return the correct title when a valid 'pageName' is provided`, () => {
    expect(createTitle("signInTitle")).toEqual("Search — Otter");
  });
  it(`should return the given value if it does not exist in the 'CONTENT' dictionary`, () => {
    expect(createTitle("Zander")).toEqual("Zander — Otter");
  });
});
