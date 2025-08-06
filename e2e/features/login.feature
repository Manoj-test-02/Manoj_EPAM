@login
Feature: Login functionality

  @login_test
  Scenario: Valid user login
    Given I am on the login page
    When I login with valid credentials
    Then I should be logged in successfully
