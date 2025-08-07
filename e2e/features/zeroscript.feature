@zero_script
Feature: Zero Script Login functionality

  @login_test @validZero @zero
  Scenario: Valid user login
    Given I navigate to login page
    When I perform "enter text 'standard_user' in field labeled Username"
    And I perform "enter text 'secret_sauce' in field labeled Password"
    And I perform "click button labeled Login"
    Then I verify "page url contains inventory"
    And I verify "element with class inventory_list exists"

  @login_test @invalidZero @zero
  Scenario: Invalid user login
    Given I navigate to login page
    When I perform "enter text 'invalid_user' in field labeled Username"
    And I perform "enter text 'wrong_password' in field labeled Password"
    And I perform "click button labeled Login"
    Then I verify "error message contains Epic sadface"

  @inventory @add_to_cartZero @zero
  Scenario: Add multiple products to cart
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add all items containing Add to cart to cart"
    Then I verify "cart badge shows correct count"

  @inventory @checkout_successZero @zero
  Scenario: Successful checkout of products
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add item Sauce Labs Backpack to cart"
    And I perform "click on shopping cart"
    And I perform "click button labeled Checkout"
    And I perform "fill checkout form with John, Doe, 12345"
    And I perform "click button labeled Continue"
    And I perform "click button labeled Finish"
    Then I verify "text Thank you for your order is visible"

  @inventory @remove_validationZero @zero
  Scenario: Validate remove button functionality
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add first item to cart"
    Then I verify "remove button is visible for first item"
    And I verify "cart badge shows 1"

  @inventory @cart_removalZero @zero
  Scenario: Remove product from cart
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add first item to cart"
    And I perform "remove first item from cart"
    Then I verify "cart is empty"
    And I verify "product should not appear in checkout page"

  @inventory @multiple_productsZero @zero
  Scenario: Add and verify multiple products in cart
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add three different products to cart"
    Then I verify "cart shows three items"

  @inventory @remove_multipleZero @zero
  Scenario: Remove multiple products from cart
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add multiple products to cart"
    And I perform "remove all products from cart"
    Then I verify "cart should be empty"

  @inventory @price_validationZero @zero
  Scenario: Validate product prices in cart
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "add products to cart"
    Then I verify "product prices in cart should match inventory prices"

  @inventory @sort_add_cartZero @zero
  Scenario: Add products after sorting
    Given I navigate to login page
    When I perform "login as standard_user"
    And I perform "sort products by price high to low"
    And I perform "add top three expensive products to cart"
    Then I verify "cart total should match sum of selected products"
