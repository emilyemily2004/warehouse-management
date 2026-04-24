import React from "react";

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

jest.mock("./App", () => () => <div>Mock App</div>);
jest.mock("./reportWebVitals", () => jest.fn());

describe("index.tsx", () => {
  test("renders app without crashing", () => {
    const div = document.createElement("div");
    div.setAttribute("id", "root");
    document.body.appendChild(div);

    expect(() => require("./index")).not.toThrow();
  });
});
