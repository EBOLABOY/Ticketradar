import { Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import { ListItemCompResponsive } from "./FlyListItemComp";
import dayjs from "dayjs";
import { formatBackendPrice } from "../../utils/priceFormatter";
import { localizeStops, getShortAirportName } from "../../utils/flightLocalizer";

const FlightsMdDownComp = ({ item, formatDuration }) => {
  return (
    <Grid2
      container
      sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
    >
      <Grid2
        item="true"
        size={{ xs: 10, sm: 8 }}
        sx={{ flexDirection: "column" }}
      >
        <ListItemCompResponsive
          imgLink={item.legs[0]?.airline?.logoUrl || ''}
          img={true}
          primary={`${dayjs(item.legs[0]?.departure_datetime || item.legs[0]?.departure).format("h:mm A")} `}
          secondary={getShortAirportName(item.legs[0]?.departure_airport?.code || item.legs[0]?.origin)}
          primary1={`${dayjs(item.legs[0]?.arrival_datetime || item.legs[0]?.arrival).format("h:mm A")}`}
          secondary1={getShortAirportName(item.legs[0]?.arrival_airport?.code || item.legs[0]?.destination)}
        />
        <Typography
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 400,
            fontSize: { xs: "10px", sm: "12px" },
          }}
        >
          {localizeStops(item.stops)}{" "}
          * {formatDuration(item.legs[0]?.duration || item.legs[0]?.durationInMinutes)} *{" "}
          {item.legs[0]?.airline?.name || '未知航空公司'}
        </Typography>
      </Grid2>
      <Grid2
        item="true"
        size={{ xs: 2, sm: 4 }}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Typography fontSize={{ xs: "10px", sm: "12px" }}>
          {formatBackendPrice(item.price).formatted}
        </Typography>
      </Grid2>
    </Grid2>
  );
};

export default FlightsMdDownComp;
