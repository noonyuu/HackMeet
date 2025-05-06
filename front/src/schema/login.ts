import {
  EMAIL_FORMAT_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  PASSWORD_LENGTH,
  PASSWORD_MINLENGTH_MESSAGE,
  PASSWORD_REQUIRED_MESSAGE,
  STRING_MESSAGE,
} from "@/constants/messages";
import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(STRING_MESSAGE),
    v.nonEmpty(EMAIL_REQUIRED_MESSAGE),
    v.email(EMAIL_FORMAT_MESSAGE),
  ),
  password: v.pipe(
    v.string(STRING_MESSAGE),
    v.nonEmpty(PASSWORD_REQUIRED_MESSAGE),
    v.minLength(PASSWORD_LENGTH, PASSWORD_MINLENGTH_MESSAGE),
  ),
});
