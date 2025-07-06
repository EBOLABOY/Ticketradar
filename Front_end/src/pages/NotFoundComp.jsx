import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NotPage from "../assets/images/no-found.svg";
import { Box } from "@mui/material";

const NotFoundComp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 5000);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
      }}
    >
      <img src={NotPage} alt="Not Found" />
    </Box>
  );
};

export default NotFoundComp;
