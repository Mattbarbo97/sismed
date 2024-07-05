import React from "react";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";
import LoginFormDesktop from "./LoginFormDesktop";
import LoginFormMobile from "./LoginFormMobile";

const LoginForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return isMobile ? <LoginFormMobile /> : <LoginFormDesktop />;
};

export default LoginForm;
