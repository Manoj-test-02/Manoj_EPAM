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
    When I login with invalid credentials
    Then I should see account locked message

  @login_test @locked
  Scenario: Locked user login
    Given I am on the login page
    When I login with locked user credentials
    Then I should see account locked message
