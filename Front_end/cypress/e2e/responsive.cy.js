describe("responsive-test", () => {
  beforeEach(() => {
    cy.visit("/"); // 不再需要硬编码URL
  });

  // iPhone 12 Pro - Mobile
  it("iphone-12pro", () => {
    cy.viewport(390, 884);
    cy.home();
    // 修改：使用断言代替固定等待
    cy.get("[data-test='landing-text']").should("be.visible");
  });

  // iPad Air - Tablet
  it("ipadAir", () => {
    cy.viewport(820, 1180);
    cy.home();
    // 修改：使用断言代替固定等待
    cy.get("[data-test='landing-text']").should("be.visible");
  });

  // Desktop
  it("desktop", () => {
    cy.viewport(1512, 982); // MacBook Pro 14"
    cy.home();
    // 修改：使用断言代替固定等待
    cy.get("[data-test='landing-text']").should("be.visible");
  });

  // Extra: Check for mobile layout
  it("mobile", () => {
    cy.viewport(375, 667);
    cy.get("[data-test='logo']").should("be.visible");
    cy.home();
    // 修改：使用断言代替固定等待
    cy.get("[data-test='landing-text']").should("be.visible");
  });
});
