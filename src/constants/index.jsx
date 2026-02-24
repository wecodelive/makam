export const REGEX_EMAIL = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i;
export const PASSWORD_LENGTH = 8;
export const REGEX_PASSWORD =
  /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+={[}\]|\\:;"'<,>.?/`~-]*$/i; // must contain alphanumeric and optional special characters
export const REGEX_LETTER = /^[a-zA-Z]+$/; // alphabet (just a word)
export const PIN_LENGTH = 4;
export const GPI_LENGTH = 12;
export const REGEX_ALPHABETS_WITH_SPACES = /^[a-zA-Z\s]+$/;
export const PHONE_NUMBER_LENGTH = 11;
export const REGEX_NAME = /^[a-zA-Z]{2,}-?[a-zA-Z]*$/; // minimum of 2 letters, accepts hypen
export const REGEX_NUMBERS = /[0-9]/;
// export const REGEX_VALID_WORD = /<.*?\/>/ // CHECK IF WORD CONTAINS < AND />
export const days = {
  Monday: "mon",
  Tuesday: "tue",
  Wednesday: "wed",
  Thursday: "thu",
  Friday: "fri",
  Saturday: "sat",
  Sunday: "sun",
};
export const SMALL_WIDTH = 600;
export const MEDIUM_WIDTH = 768;
export const LARGE_WIDTH = 1100;
export const XLARGE_WIDTH = 1280;
