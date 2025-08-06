@echo off
echo Running tests...

:: Run cucumber tests and save exit code
call cucumber-js -p default --format json:reports/cucumber-report.json --format summary
set TEST_EXIT_CODE=%ERRORLEVEL%

:: Always generate report regardless of test result
call ts-node report-generator.ts

:: Exit with the original test exit code
exit /b %TEST_EXIT_CODE%
