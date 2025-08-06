export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ValidLoginScenario {
  login_credentials: LoginCredentials;
  expected: {
    url: string;
  };
}

export interface InvalidLoginScenario {
  login_credentials: LoginCredentials;
  expected: {
    error_message: string;
  };
}

export type ScenarioName = "Valid user login" | "Invalid user login" | "Locked user login";
export type LoginScenario = ValidLoginScenario | InvalidLoginScenario;

export interface LoginJson {
  [key: string]: LoginScenario;
}

export interface LoginScenarioData {
  login_credentials: LoginCredentials;
}
