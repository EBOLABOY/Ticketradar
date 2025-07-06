describe("home-page", () => {
  beforeEach(() => {
    cy.visit("/"); // 不再需要硬编码URL
    cy.viewport(1200, 1200);
  });
  it("home-page-redirect", () => {
    cy.get("[data-test='logo']").should("be.visible");
    const expectedLogoSrc = "/static/media/googlelogo_dark";
    cy.get("[data-test='logo']")
      .should("have.attr", "src")
      .and("include", expectedLogoSrc);
  });
  it("flights-search", () => {
    cy.visit("/"); // 不再需要硬编码URL
    cy.get("[data-test='landing-text']")
      .should("be.visible")
      .contains("Flights");
  });
});
