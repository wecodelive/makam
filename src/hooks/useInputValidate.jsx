import { useState } from "react";
import {
  PASSWORD_LENGTH,
  PIN_LENGTH,
  REGEX_EMAIL,
  REGEX_PASSWORD,
  REGEX_NAME,
  REGEX_ALPHABETS_WITH_SPACES,
  PHONE_NUMBER_LENGTH,
} from "../constants/index";

export default function useInputValidate() {
  const [error, setError] = useState("");

  const checkPassword = ({ value }) => {
    if (value?.length < PASSWORD_LENGTH || !REGEX_PASSWORD.test(value)) {
      setError(
        `Password must be ${PASSWORD_LENGTH} or more characters and must be alphanumeric`,
      );
      return false;
    }

    setError("");
    return true;
  };

  const checkAlphabetsWithSpaces = ({ value }) => {
    if (!REGEX_ALPHABETS_WITH_SPACES.test(value)) {
      setError("Numbers and special characters are not allowed");
      return false;
    }

    setError("");
    return true;
  };

  const checkEmail = ({ value }) => {
    if (!REGEX_EMAIL.test(value)) {
      setError("Please enter a valid email");
      return false;
    }

    setError("");
    return true;
  };

  const checkName = ({ value }) => {
    if (!REGEX_NAME.test(value)) {
      if (value?.length < 2) {
        setError("Name must be more than 1 character");
        return false;
      }
      setError("Name must contain only alphabets and cannot have spaces");
      return false;
    }
    setError("");
    return true;
  };

  const checkConfirmPassword = ({ name, value }) => {
    if (value?.length === 0) return false;
    if (
      document.getElementById(name)?.value ===
      document.getElementById("password")?.value
    ) {
      setError("");
      return true;
    }

    setError("Passwords do not match!");
    return false;
  };

  const checkPin = (value) => {
    if (value?.length !== PIN_LENGTH) return false;
    setError("");
    return true;
  };

  const checkPhoneNumber = ({ value }) => {
    if (value.charAt(0) === "0") {
      if (value.length > PHONE_NUMBER_LENGTH) {
        setError("Phone number should not be more than 11 digits.");
        return false;
      }
      if (value.length < PHONE_NUMBER_LENGTH) {
        setError("Phone number should not be less than 11 digits.");
        return false;
      }
      if (/^0\d{10}$/.test(value)) {
        setError("");
        return true;
      }
    } else {
      if (value.length > PHONE_NUMBER_LENGTH - 1)
        return setError("Phone number should not be more than 10 digits.");
      if (value.length < PHONE_NUMBER_LENGTH - 1)
        return setError("Phone number should not be more than 10 digits.");
      if (/^[1-9]\d{9}$/.test(value)) {
        setError("");
        return true;
      }
    }
  };

  const validate = ({ name, value }) => {
    switch (name) {
      case "password":
        return checkPassword({ value });
      case "firstName":
      case "lastName":
        return checkName({ name, value });
      case "emailAddress":
      case "businessEmailAddress":
      case "email":
        return checkEmail({ name, value });
      case "confirmPassword":
      case "confirm_password":
        return checkConfirmPassword({ name, value });
      case "pin":
        return checkPin(value);
      case "relationship":
        return checkAlphabetsWithSpaces({ name, value });
      case "phoneNumber":
      case "phone_number":
        return checkPhoneNumber({ value });
      default:
        setError("");
        return true;
    }
  };

  return {
    error,
    setError,
    validate,
    checkPin,
  };
}
