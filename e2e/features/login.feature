@login
Feature: Login functionality

  @login_test @valid
  Scenario: Valid user login
    Given I am on the login page
    When I login with valid credentials
    Then I should be logged in successfully

  @login_test @invalid
  Scenario: Invalid user login
    Given I am on the login page
    When I login directly with invalid credentials
    Then I should see account locked message

  @login_test @locked
  Scenario: Locked user login
    Given I am on the login page
    When I login directly with locked user credentials
    Then I should see account locked message

  @inventory @add_to_cart
  Scenario: Add multiple products to cart
    Given I am on the login page
    When I login with valid credentials
    When I am on the inventory page
    And I add multiple products to cart
    Then cart badge should display correct item count

  @inventory @checkout_success
  Scenario: Successful checkout of products
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add products to cart
    And I proceed to checkout page
    And I enter checkout information
      | firstName | lastName | zipCode |
      | John      | Doe      | 12345   |
    And I click continue button
    And I click finish button on summary page
    Then I should see checkout success message

  @inventory @remove_validation
  Scenario: Validate remove button functionality
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add a product to cart
    Then remove button should be enabled for added product

  @inventory @cart_removal
  Scenario: Remove product from cart
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add a product to cart
    And I remove the product from cart
    Then product should not appear in checkout page

  @inventory @multiple_products
  Scenario: Add and verify multiple products in cart
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add three different products to cart
    Then cart should show three items

  @inventory @remove_multiple
  Scenario: Remove multiple products from cart
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add multiple products to cart
    And I remove all products from cart
    Then cart should be empty

  @inventory @price_validation
  Scenario: Validate product prices in cart
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I add products to cart
    Then product prices in cart should match inventory prices

  @inventory @sort_add_cart
  Scenario: Add products after sorting
    Given I am on the login page
    When I login with valid credentials
    And I am on the inventory page
    And I sort products by price high to low
    And I add top three expensive products to cart
    Then cart total should match sum of selected products
