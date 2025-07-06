import React from "react";
import { Chip as MuiChip } from "@mui/material"; // 关键修改：从MUI导入并重命名

const Chip = ({
  label,
  id, // 使用唯一的 id 代替 index
  icon,
  variant,
}) => {
  return (
    <MuiChip
      key={id} // 使用稳定的 id 作为 key
      label={label}
      icon={icon}
      variant={variant}
      sx={{
        fontWeight: "bold",
        padding: "17px",
        cursor: "pointer",
        fontSize: "14px",
        whiteSpace: "nowrap",
        borderRadius: "20px",
      }}
    />
  );
};

export default Chip;
